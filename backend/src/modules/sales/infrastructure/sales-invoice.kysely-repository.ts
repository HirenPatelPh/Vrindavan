import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { SalesInvoiceLines, SalesInvoices } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateSalesInvoiceProps,
  SalesInvoice,
  SalesInvoiceLine,
  SalesInvoiceStatus,
} from '../domain/sales-invoice.entity';
import { ISalesInvoiceRepository } from '../domain/sales-invoice.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';
import { getCurrentFinancialYearId, nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<SalesInvoices>;
type LineRow = Selectable<SalesInvoiceLines>;

function toLineDomain(row: LineRow): SalesInvoiceLine {
  return new SalesInvoiceLine(
    row.id,
    row.invoice_id,
    row.product_id,
    row.product_unit_id,
    row.batch_id,
    Number(row.quantity),
    Number(row.rate),
    Number(row.discount_percent),
    row.gst_id,
    Number(row.tax_amount),
    Number(row.line_total),
  );
}

function toDomain(header: HeaderRow, lines: SalesInvoiceLine[]): SalesInvoice {
  return new SalesInvoice(
    header.id,
    header.invoice_number,
    header.invoice_date,
    header.dc_id,
    header.so_id,
    header.customer_id,
    header.financial_year_id,
    header.due_date,
    header.status as SalesInvoiceStatus,
    Number(header.subtotal),
    Number(header.tax_amount),
    Number(header.discount_amount),
    Number(header.total_amount),
    Number(header.paid_amount),
    header.created_by,
    header.approved_by,
    header.approved_at,
    header.created_at,
    header.updated_at,
    lines,
  );
}

interface ComputedLine {
  subtotal: number;
  taxAmount: number;
  lineTotal: number;
}

/** subtotal after per-line discount, tax computed separately and stored — mirrors Purchase Invoice's tax-calc. */
async function computeLine(
  executor: Executor,
  quantity: number,
  rate: number,
  discountPercent: number,
  gstId: string | undefined,
): Promise<ComputedLine> {
  const subtotal = quantity * rate * (1 - discountPercent / 100);
  let taxAmount = 0;
  if (gstId) {
    const gst = await executor.selectFrom('gst_rates').select('total_rate').where('id', '=', gstId).executeTakeFirst();
    taxAmount = gst ? subtotal * (Number(gst.total_rate) / 100) : 0;
  }
  return { subtotal, taxAmount, lineTotal: subtotal + taxAmount };
}

@Injectable()
export class SalesInvoiceKyselyRepository implements ISalesInvoiceRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, invoiceId: string): Promise<SalesInvoiceLine[]> {
    const rows = await executor
      .selectFrom('sales_invoice_lines')
      .selectAll()
      .where('invoice_id', '=', invoiceId)
      .execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<SalesInvoice[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('sales_invoices').selectAll().orderBy('invoice_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<SalesInvoice | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('sales_invoices').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateSalesInvoiceProps, createdBy?: string): Promise<SalesInvoice> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const financialYearId = await getCurrentFinancialYearId(trx);
      const invoiceNumber = await nextDocumentNumber(trx, 'sales_invoice', 'SINV');

      const computed = await Promise.all(
        props.lines.map((line) =>
          computeLine(trx, line.quantity, line.rate, line.discountPercent ?? 0, line.gstId),
        ),
      );
      const subtotal = computed.reduce((sum, c) => sum + c.subtotal, 0);
      const taxAmount = computed.reduce((sum, c) => sum + c.taxAmount, 0);
      const discountAmount = props.discountAmount ?? 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const header = await trx
        .insertInto('sales_invoices')
        .values({
          invoice_number: invoiceNumber,
          ...(props.invoiceDate ? { invoice_date: props.invoiceDate } : {}),
          dc_id: props.dcId ?? null,
          so_id: props.soId ?? null,
          customer_id: props.customerId,
          financial_year_id: financialYearId,
          due_date: props.dueDate ?? null,
          status: 'draft',
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: SalesInvoiceLine[] = [];
      for (let i = 0; i < props.lines.length; i++) {
        const line = props.lines[i];
        const c = computed[i];
        const lineRow = await trx
          .insertInto('sales_invoice_lines')
          .values({
            invoice_id: header.id,
            product_id: line.productId,
            product_unit_id: line.productUnitId,
            batch_id: line.batchId ?? null,
            quantity: line.quantity,
            rate: line.rate,
            discount_percent: line.discountPercent ?? 0,
            gst_id: line.gstId ?? null,
            tax_amount: c.taxAmount,
            line_total: c.lineTotal,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async approve(id: string, approvedBy?: string): Promise<SalesInvoice> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('sales_invoices').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Sales invoice ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Sales invoice ${id} is not in draft status`);

      const updatedHeader = await trx
        .updateTable('sales_invoices')
        .set({
          status: 'approved',
          approved_by: approvedBy ?? null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toDomain(updatedHeader, await this.linesFor(trx, id));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('sales_invoices')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
