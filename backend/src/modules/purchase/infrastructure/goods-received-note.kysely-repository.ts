import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { GoodsReceivedNotes, GrnLines } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateGoodsReceivedNoteProps,
  GoodsReceivedNote,
  GoodsReceivedNoteLine,
  GoodsReceivedNoteStatus,
} from '../domain/goods-received-note.entity';
import { IGoodsReceivedNoteRepository } from '../domain/goods-received-note.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/purchase-document.errors';
import { nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor, postStockMovement } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<GoodsReceivedNotes>;
type LineRow = Selectable<GrnLines>;

function toLineDomain(row: LineRow): GoodsReceivedNoteLine {
  return new GoodsReceivedNoteLine(
    row.id,
    row.grn_id,
    row.po_line_id,
    row.product_id,
    row.product_unit_id,
    row.batch_id,
    Number(row.quantity),
    Number(row.rate),
    row.remarks,
  );
}

function toDomain(header: HeaderRow, lines: GoodsReceivedNoteLine[]): GoodsReceivedNote {
  return new GoodsReceivedNote(
    header.id,
    header.grn_number,
    header.grn_date,
    header.po_id,
    header.supplier_id,
    header.warehouse_id,
    header.transporter_id,
    header.status as GoodsReceivedNoteStatus,
    header.remarks,
    header.created_by,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class GoodsReceivedNoteKyselyRepository implements IGoodsReceivedNoteRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, grnId: string): Promise<GoodsReceivedNoteLine[]> {
    const rows = await executor.selectFrom('grn_lines').selectAll().where('grn_id', '=', grnId).execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<GoodsReceivedNote[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('goods_received_notes').selectAll().orderBy('grn_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<GoodsReceivedNote | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('goods_received_notes').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateGoodsReceivedNoteProps, createdBy?: string): Promise<GoodsReceivedNote> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const grnNumber = await nextDocumentNumber(trx, 'grn', 'GRN');

      const header = await trx
        .insertInto('goods_received_notes')
        .values({
          grn_number: grnNumber,
          ...(props.grnDate ? { grn_date: props.grnDate } : {}),
          po_id: props.poId ?? null,
          supplier_id: props.supplierId,
          warehouse_id: props.warehouseId,
          transporter_id: props.transporterId ?? null,
          remarks: props.remarks ?? null,
          status: 'draft',
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: GoodsReceivedNoteLine[] = [];
      for (const line of props.lines) {
        const lineRow = await trx
          .insertInto('grn_lines')
          .values({
            grn_id: header.id,
            po_line_id: line.poLineId ?? null,
            product_id: line.productId,
            product_unit_id: line.productUnitId,
            batch_id: line.batchId ?? null,
            quantity: line.quantity,
            rate: line.rate,
            remarks: line.remarks ?? null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async complete(id: string): Promise<GoodsReceivedNote> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('goods_received_notes').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Goods received note ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Goods received note ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('grn_lines').selectAll().where('grn_id', '=', id).execute();

      for (const line of lineRows) {
        const productUnit = await trx
          .selectFrom('product_units')
          .select('conversion_factor')
          .where('id', '=', line.product_unit_id)
          .executeTakeFirstOrThrow();
        const conversionFactor = Number(productUnit.conversion_factor);
        const quantity = Number(line.quantity);
        const rate = Number(line.rate);
        const baseQty = quantity * conversionFactor;
        const baseUnitCost = rate / conversionFactor;

        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          batchId: line.batch_id,
          movementType: 'purchase_in',
          qtyIn: baseQty,
          unitCost: baseUnitCost,
          referenceType: 'grn',
          referenceId: header.id,
          referenceLineId: line.id,
        });

        if (line.po_line_id) {
          await trx
            .updateTable('purchase_order_lines')
            .set((eb) => ({ received_quantity: eb('received_quantity', '+', quantity.toString()) }))
            .where('id', '=', line.po_line_id)
            .execute();
        }
      }

      const updatedHeader = await trx
        .updateTable('goods_received_notes')
        .set({ status: 'completed', updated_at: new Date().toISOString() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (header.po_id) {
        const poLines = await trx
          .selectFrom('purchase_order_lines')
          .select(['quantity', 'received_quantity'])
          .where('po_id', '=', header.po_id)
          .execute();
        const allReceived = poLines.every((l) => Number(l.received_quantity) >= Number(l.quantity));
        const anyReceived = poLines.some((l) => Number(l.received_quantity) > 0);
        const newPoStatus = allReceived ? 'completed' : anyReceived ? 'partially_received' : null;

        if (newPoStatus) {
          await trx
            .updateTable('purchase_orders')
            .set({ status: newPoStatus, updated_at: new Date().toISOString() })
            .where('id', '=', header.po_id)
            .where('status', 'in', ['approved', 'partially_received'])
            .execute();
        }
      }

      return toDomain(updatedHeader, lineRows.map(toLineDomain));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('goods_received_notes')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
