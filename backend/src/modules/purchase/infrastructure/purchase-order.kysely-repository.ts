import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { PurchaseOrderLines, PurchaseOrders } from '../../../infrastructure/database/kysely/db.types';
import {
  CreatePurchaseOrderProps,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseOrderStatus,
} from '../domain/purchase-order.entity';
import { IPurchaseOrderRepository } from '../domain/purchase-order.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/purchase-document.errors';
import { getCurrentFinancialYearId, nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<PurchaseOrders>;
type LineRow = Selectable<PurchaseOrderLines>;

function toLineDomain(row: LineRow): PurchaseOrderLine {
  return new PurchaseOrderLine(
    row.id,
    row.po_id,
    row.product_id,
    row.product_unit_id,
    Number(row.quantity),
    Number(row.received_quantity),
    Number(row.rate),
    Number(row.discount_percent),
    row.gst_id,
    Number(row.line_total),
  );
}

function toDomain(header: HeaderRow, lines: PurchaseOrderLine[]): PurchaseOrder {
  return new PurchaseOrder(
    header.id,
    header.po_number,
    header.po_date,
    header.supplier_id,
    header.warehouse_id,
    header.financial_year_id,
    header.expected_delivery_date,
    header.status as PurchaseOrderStatus,
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

/** subtotal after per-line discount, then GST applied on top (0 if no gst_id) — see Phase 6 plan's tax-calc decision. */
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
export class PurchaseOrderKyselyRepository implements IPurchaseOrderRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, poId: string): Promise<PurchaseOrderLine[]> {
    const rows = await executor.selectFrom('purchase_order_lines').selectAll().where('po_id', '=', poId).execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<PurchaseOrder[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('purchase_orders').selectAll().orderBy('po_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('purchase_orders').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreatePurchaseOrderProps, createdBy?: string): Promise<PurchaseOrder> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const financialYearId = await getCurrentFinancialYearId(trx);
      const poNumber = await nextDocumentNumber(trx, 'purchase_order', 'PO');

      const lineTotals = await Promise.all(
        props.lines.map((line) =>
          computeLineTotal(trx, line.quantity, line.rate, line.discountPercent ?? 0, line.gstId),
        ),
      );
      const totalAmount = lineTotals.reduce((sum, t) => sum + t, 0);

      const header = await trx
        .insertInto('purchase_orders')
        .values({
          po_number: poNumber,
          ...(props.poDate ? { po_date: props.poDate } : {}),
          supplier_id: props.supplierId,
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

      const lines: PurchaseOrderLine[] = [];
      for (let i = 0; i < props.lines.length; i++) {
        const line = props.lines[i];
        const lineRow = await trx
          .insertInto('purchase_order_lines')
          .values({
            po_id: header.id,
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

  async approve(id: string, approvedBy?: string): Promise<PurchaseOrder> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('purchase_orders').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Purchase order ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Purchase order ${id} is not in draft status`);

      const updatedHeader = await trx
        .updateTable('purchase_orders')
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

  async cancel(id: string): Promise<PurchaseOrder> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('purchase_orders').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Purchase order ${id} not found`);
      if (header.status !== 'draft' && header.status !== 'approved') {
        throw new DocumentNotDraftError(
          `Purchase order ${id} cannot be cancelled once receiving has started (status: ${header.status})`,
        );
      }

      const updatedHeader = await trx
        .updateTable('purchase_orders')
        .set({ status: 'cancelled', updated_at: new Date().toISOString() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toDomain(updatedHeader, await this.linesFor(trx, id));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('purchase_orders')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
