import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { DamagedStock as DamagedStockRow, DamagedStockLines } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateDamagedStockProps,
  DamagedStock,
  DamagedStockLine,
  DamagedStockStatus,
} from '../domain/damaged-stock.entity';
import { IDamagedStockRepository } from '../domain/damaged-stock.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';
import { nextDocumentNumber } from './document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from './stock-posting.helper';

type HeaderRow = Selectable<DamagedStockRow>;
type LineRow = Selectable<DamagedStockLines>;

function toLineDomain(row: LineRow): DamagedStockLine {
  return new DamagedStockLine(row.id, row.damage_id, row.product_id, row.batch_id, row.rack_id, row.location_id, Number(row.quantity), row.remarks);
}

function toDomain(header: HeaderRow, lines: DamagedStockLine[]): DamagedStock {
  return new DamagedStock(
    header.id,
    header.damage_number,
    header.damage_date,
    header.warehouse_id,
    header.reason,
    header.status as DamagedStockStatus,
    header.created_by,
    header.approved_by,
    header.approved_at,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class DamagedStockKyselyRepository implements IDamagedStockRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, damageId: string): Promise<DamagedStockLine[]> {
    const rows = await executor.selectFrom('damaged_stock_lines').selectAll().where('damage_id', '=', damageId).execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<DamagedStock[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('damaged_stock').selectAll().orderBy('damage_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<DamagedStock | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('damaged_stock').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateDamagedStockProps, createdBy?: string): Promise<DamagedStock> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const damageNumber = await nextDocumentNumber(trx, 'damaged_stock', 'DMG');
      const header = await trx
        .insertInto('damaged_stock')
        .values({
          damage_number: damageNumber,
          ...(props.damageDate ? { damage_date: props.damageDate } : {}),
          warehouse_id: props.warehouseId,
          reason: props.reason ?? null,
          status: 'draft',
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: DamagedStockLine[] = [];
      for (const line of props.lines) {
        const lineRow = await trx
          .insertInto('damaged_stock_lines')
          .values({
            damage_id: header.id,
            product_id: line.productId,
            batch_id: line.batchId ?? null,
            rack_id: line.rackId ?? null,
            location_id: line.locationId ?? null,
            quantity: line.quantity,
            remarks: line.remarks ?? null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async approve(id: string, approvedBy?: string): Promise<DamagedStock> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('damaged_stock').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Damaged stock entry ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Damaged stock entry ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('damaged_stock_lines').selectAll().where('damage_id', '=', id).execute();

      for (const line of lineRows) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
        });
        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
          movementType: 'damage_out',
          qtyOut: Number(line.quantity),
          unitCost: liveBalance?.averageCost ?? 0,
          referenceType: 'damaged_stock',
          referenceId: header.id,
          referenceLineId: line.id,
        });
      }

      const updatedHeader = await trx
        .updateTable('damaged_stock')
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
      .deleteFrom('damaged_stock')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
