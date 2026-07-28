import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { SalesOrderLines, SalesOrders } from '../../../infrastructure/database/kysely/db.types';
import { CreateSalesOrderProps, SalesOrder, SalesOrderLine, SalesOrderStatus } from '../domain/sales-order.entity';
import { ISalesOrderRepository } from '../domain/sales-order.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';
import { getCurrentFinancialYearId, nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<SalesOrders>;
type LineRow = Selectable<SalesOrderLines>;

export function toSalesOrderLineDomain(row: LineRow): SalesOrderLine {
  return new SalesOrderLine(
    row.id,
    row.so_id,
    row.product_id,
    row.product_unit_id,
    Number(row.quantity),
    Number(row.delivered_quantity),
    Number(row.rate),
    Number(row.discount_percent),
    row.gst_id,
    Number(row.line_total),
  );
}

export function toSalesOrderDomain(header: HeaderRow, lines: SalesOrderLine[]): SalesOrder {
  return new SalesOrder(
    header.id,
    header.so_number,
    header.so_date,
    header.customer_id,
    header.quotation_id,
    header.warehouse_id,
    header.financial_year_id,
    header.expected_delivery_date,
    header.status as SalesOrderStatus,
    header.remarks,
    Number(header.total_amount),
    header.created_by,
    header.approved_by,
    header.approved_at,
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
export class SalesOrderKyselyRepository implements ISalesOrderRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, soId: string): Promise<SalesOrderLine[]> {
    const rows = await executor.selectFrom('sales_order_lines').selectAll().where('so_id', '=', soId).execute();
    return rows.map(toSalesOrderLineDomain);
  }

  async findAll(): Promise<SalesOrder[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('sales_orders').selectAll().orderBy('so_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toSalesOrderDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<SalesOrder | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('sales_orders').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toSalesOrderDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateSalesOrderProps, createdBy?: string): Promise<SalesOrder> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const financialYearId = await getCurrentFinancialYearId(trx);
      const soNumber = await nextDocumentNumber(trx, 'sales_order', 'SO');

      const lineTotals = await Promise.all(
        props.lines.map((line) =>
          line.precomputedLineTotal !== undefined
            ? Promise.resolve(line.precomputedLineTotal)
            : computeLineTotal(trx, line.quantity, line.rate, line.discountPercent ?? 0, line.gstId),
        ),
      );
      const totalAmount = lineTotals.reduce((sum, t) => sum + t, 0);

      const header = await trx
        .insertInto('sales_orders')
        .values({
          so_number: soNumber,
          ...(props.soDate ? { so_date: props.soDate } : {}),
          customer_id: props.customerId,
          quotation_id: props.quotationId ?? null,
          warehouse_id: props.warehouseId,
          financial_year_id: financialYearId,
          expected_delivery_date: props.expectedDeliveryDate ?? null,
          remarks: props.remarks ?? null,
          status: 'draft',
          total_amount: totalAmount,
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: SalesOrderLine[] = [];
      for (let i = 0; i < props.lines.length; i++) {
        const line = props.lines[i];
        const lineRow = await trx
          .insertInto('sales_order_lines')
          .values({
            so_id: header.id,
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
        lines.push(toSalesOrderLineDomain(lineRow));
      }
      return toSalesOrderDomain(header, lines);
    });
  }

  async approve(id: string, approvedBy?: string): Promise<SalesOrder> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('sales_orders').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Sales order ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Sales order ${id} is not in draft status`);

      const updatedHeader = await trx
        .updateTable('sales_orders')
        .set({
          status: 'approved',
          approved_by: approvedBy ?? null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toSalesOrderDomain(updatedHeader, await this.linesFor(trx, id));
    });
  }

  async cancel(id: string): Promise<SalesOrder> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('sales_orders').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Sales order ${id} not found`);
      if (header.status !== 'draft' && header.status !== 'approved') {
        throw new DocumentNotDraftError(
          `Sales order ${id} cannot be cancelled once delivery has started (status: ${header.status})`,
        );
      }

      const updatedHeader = await trx
        .updateTable('sales_orders')
        .set({ status: 'cancelled', updated_at: new Date().toISOString() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toSalesOrderDomain(updatedHeader, await this.linesFor(trx, id));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('sales_orders')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
