import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { StockAdjustmentLines, StockAdjustments } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateStockAdjustmentProps,
  StockAdjustment,
  StockAdjustmentLine,
  StockAdjustmentStatus,
} from '../domain/stock-adjustment.entity';
import { IStockAdjustmentRepository } from '../domain/stock-adjustment.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';
import { nextDocumentNumber } from './document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from './stock-posting.helper';

type HeaderRow = Selectable<StockAdjustments>;
type LineRow = Selectable<StockAdjustmentLines>;

function toLineDomain(row: LineRow): StockAdjustmentLine {
  return new StockAdjustmentLine(
    row.id,
    row.adjustment_id,
    row.product_id,
    row.batch_id,
    row.rack_id,
    row.location_id,
    Number(row.system_quantity),
    Number(row.adjusted_quantity),
    row.remarks,
  );
}

function toDomain(header: HeaderRow, lines: StockAdjustmentLine[]): StockAdjustment {
  return new StockAdjustment(
    header.id,
    header.adjustment_number,
    header.adjustment_date,
    header.warehouse_id,
    header.reason,
    header.status as StockAdjustmentStatus,
    header.created_by,
    header.approved_by,
    header.approved_at,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class StockAdjustmentKyselyRepository implements IStockAdjustmentRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, adjustmentId: string): Promise<StockAdjustmentLine[]> {
    const rows = await executor
      .selectFrom('stock_adjustment_lines')
      .selectAll()
      .where('adjustment_id', '=', adjustmentId)
      .execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<StockAdjustment[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('stock_adjustments').selectAll().orderBy('adjustment_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<StockAdjustment | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('stock_adjustments').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateStockAdjustmentProps, createdBy?: string): Promise<StockAdjustment> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const adjustmentNumber = await nextDocumentNumber(trx, 'stock_adjustment', 'ADJ');
      const header = await trx
        .insertInto('stock_adjustments')
        .values({
          adjustment_number: adjustmentNumber,
          ...(props.adjustmentDate ? { adjustment_date: props.adjustmentDate } : {}),
          warehouse_id: props.warehouseId,
          reason: props.reason ?? null,
          status: 'draft',
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: StockAdjustmentLine[] = [];
      for (const line of props.lines) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.productId,
          warehouseId: props.warehouseId,
          rackId: line.rackId,
          locationId: line.locationId,
          batchId: line.batchId,
        });
        const lineRow = await trx
          .insertInto('stock_adjustment_lines')
          .values({
            adjustment_id: header.id,
            product_id: line.productId,
            batch_id: line.batchId ?? null,
            rack_id: line.rackId ?? null,
            location_id: line.locationId ?? null,
            system_quantity: liveBalance?.quantity ?? 0,
            adjusted_quantity: line.adjustedQuantity,
            remarks: line.remarks ?? null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async approve(id: string, approvedBy?: string): Promise<StockAdjustment> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('stock_adjustments').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Stock adjustment ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Stock adjustment ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('stock_adjustment_lines').selectAll().where('adjustment_id', '=', id).execute();

      for (const line of lineRows) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
        });
        const liveQuantity = liveBalance?.quantity ?? 0;
        const diff = Number(line.adjusted_quantity) - liveQuantity;
        if (diff === 0) continue;

        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
          movementType: diff > 0 ? 'adjustment_in' : 'adjustment_out',
          qtyIn: diff > 0 ? diff : undefined,
          qtyOut: diff < 0 ? Math.abs(diff) : undefined,
          unitCost: liveBalance?.averageCost ?? 0,
          referenceType: 'stock_adjustment',
          referenceId: header.id,
          referenceLineId: line.id,
        });
      }

      const updatedHeader = await trx
        .updateTable('stock_adjustments')
        .set({
          status: 'approved',
          approved_by: approvedBy ?? null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toDomain(updatedHeader, lineRows.map(toLineDomain));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('stock_adjustments')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
