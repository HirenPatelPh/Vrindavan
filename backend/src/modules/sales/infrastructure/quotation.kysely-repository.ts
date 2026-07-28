import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { QuotationLines, Quotations } from '../../../infrastructure/database/kysely/db.types';
import { CreateQuotationProps, Quotation, QuotationLine, QuotationStatus } from '../domain/quotation.entity';
import { SalesOrder } from '../domain/sales-order.entity';
import { IQuotationRepository } from '../domain/quotation.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';
import { getCurrentFinancialYearId, nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor } from '../../inventory/infrastructure/stock-posting.helper';
import { toSalesOrderDomain, toSalesOrderLineDomain } from './sales-order.kysely-repository';

type HeaderRow = Selectable<Quotations>;
type LineRow = Selectable<QuotationLines>;

function toLineDomain(row: LineRow): QuotationLine {
  return new QuotationLine(
    row.id,
    row.quotation_id,
    row.product_id,
    row.product_unit_id,
    Number(row.quantity),
    Number(row.rate),
    Number(row.discount_percent),
    row.gst_id,
    Number(row.line_total),
  );
}

function toDomain(header: HeaderRow, lines: QuotationLine[]): Quotation {
  return new Quotation(
    header.id,
    header.quotation_number,
    header.quotation_date,
    header.customer_id,
    header.valid_until,
    header.status as QuotationStatus,
    header.remarks,
    Number(header.total_amount),
    header.created_by,
    header.created_at,
    header.updated_at,
    lines,
  );
}

/** subtotal after per-line discount, then GST applied on top (0 if no gst_id) — mirrors Purchase Order's tax-calc. */
async function computeLineTotal(
  executor: Executor,
  quantity: number,
  rate: number,
  discountPercent: number,
  gstId: string | undefined,
): Promise<number> {
  const subtotal = quantity * rate * (1 - discountPercent / 100);
  if (!gstId) return subtotal;
  const gst = await executor.selectFrom('gst_rates').select('total_rate').where('id', '=', gstId).executeTakeFirst();
  const rateFraction = gst ? Number(gst.total_rate) / 100 : 0;
  return subtotal * (1 + rateFraction);
}

@Injectable()
export class QuotationKyselyRepository implements IQuotationRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, quotationId: string): Promise<QuotationLine[]> {
    const rows = await executor
      .selectFrom('quotation_lines')
      .selectAll()
      .where('quotation_id', '=', quotationId)
      .execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<Quotation[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('quotations').selectAll().orderBy('quotation_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<Quotation | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('quotations').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateQuotationProps, createdBy?: string): Promise<Quotation> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const quotationNumber = await nextDocumentNumber(trx, 'quotation', 'QTN');

      const lineTotals = await Promise.all(
        props.lines.map((line) =>
          computeLineTotal(trx, line.quantity, line.rate, line.discountPercent ?? 0, line.gstId),
        ),
      );
      const totalAmount = lineTotals.reduce((sum, t) => sum + t, 0);

      const header = await trx
        .insertInto('quotations')
        .values({
          quotation_number: quotationNumber,
          ...(props.quotationDate ? { quotation_date: props.quotationDate } : {}),
          customer_id: props.customerId,
          valid_until: props.validUntil ?? null,
          remarks: props.remarks ?? null,
          status: 'draft',
          total_amount: totalAmount,
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: QuotationLine[] = [];
      for (let i = 0; i < props.lines.length; i++) {
        const line = props.lines[i];
        const lineRow = await trx
          .insertInto('quotation_lines')
          .values({
            quotation_id: header.id,
            product_id: line.productId,
            product_unit_id: line.productUnitId,
            quantity: line.quantity,
            rate: line.rate,
            discount_percent: line.discountPercent ?? 0,
            gst_id: line.gstId ?? null,
            line_total: lineTotals[i],
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  private async transitionStatus(id: string, from: QuotationStatus, to: QuotationStatus): Promise<Quotation> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('quotations').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Quotation ${id} not found`);
      if (header.status !== from) {
        throw new DocumentNotDraftError(`Quotation ${id} is not in ${from} status (currently ${header.status})`);
      }

      const updatedHeader = await trx
        .updateTable('quotations')
        .set({ status: to, updated_at: new Date().toISOString() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toDomain(updatedHeader, await this.linesFor(trx, id));
    });
  }

  send(id: string): Promise<Quotation> {
    return this.transitionStatus(id, 'draft', 'sent');
  }

  accept(id: string): Promise<Quotation> {
    return this.transitionStatus(id, 'sent', 'accepted');
  }

  reject(id: string): Promise<Quotation> {
    return this.transitionStatus(id, 'sent', 'rejected');
  }

  async convertToSalesOrder(id: string, warehouseId: string, createdBy?: string): Promise<SalesOrder> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('quotations').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Quotation ${id} not found`);
      if (header.status !== 'accepted') {
        throw new DocumentNotDraftError(`Quotation ${id} is not in accepted status (currently ${header.status})`);
      }

      const quotationLines = await trx
        .selectFrom('quotation_lines')
        .selectAll()
        .where('quotation_id', '=', id)
        .execute();

      const financialYearId = await getCurrentFinancialYearId(trx);
      const soNumber = await nextDocumentNumber(trx, 'sales_order', 'SO');

      const soHeader = await trx
        .insertInto('sales_orders')
        .values({
          so_number: soNumber,
          customer_id: header.customer_id,
          quotation_id: header.id,
          warehouse_id: warehouseId,
          financial_year_id: financialYearId,
          status: 'draft',
          total_amount: Number(header.total_amount),
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const soLines = [];
      for (const line of quotationLines) {
        const soLineRow = await trx
          .insertInto('sales_order_lines')
          .values({
            so_id: soHeader.id,
            product_id: line.product_id,
            product_unit_id: line.product_unit_id,
            quantity: line.quantity,
            rate: line.rate,
            discount_percent: line.discount_percent,
            gst_id: line.gst_id,
            line_total: line.line_total,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        soLines.push(toSalesOrderLineDomain(soLineRow));
      }

      await trx
        .updateTable('quotations')
        .set({ status: 'converted', updated_at: new Date().toISOString() })
        .where('id', '=', id)
        .execute();

      return toSalesOrderDomain(soHeader, soLines);
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('quotations')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
