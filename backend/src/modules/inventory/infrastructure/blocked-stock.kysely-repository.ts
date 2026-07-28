import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { BlockedStockEntries } from '../../../infrastructure/database/kysely/db.types';
import {
  BlockedStockEntry,
  BlockedStockFilters,
  BlockedStockStatus,
  CreateBlockedStockProps,
} from '../domain/blocked-stock.entity';
import { IBlockedStockRepository } from '../domain/blocked-stock.repository.interface';

type Row = Selectable<BlockedStockEntries>;

function toDomain(row: Row): BlockedStockEntry {
  return new BlockedStockEntry(
    row.id,
    row.product_id,
    row.warehouse_id,
    row.rack_id,
    row.location_id,
    row.batch_id,
    Number(row.quantity),
    row.reason,
    row.status as BlockedStockStatus,
    row.blocked_by,
    row.blocked_at,
    row.released_by,
    row.released_at,
  );
}

@Injectable()
export class BlockedStockKyselyRepository implements IBlockedStockRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(filters: BlockedStockFilters): Promise<BlockedStockEntry[]> {
    let query = this.tenantDb.getDb().selectFrom('blocked_stock_entries').selectAll();
    if (filters.productId) query = query.where('product_id', '=', filters.productId);
    if (filters.warehouseId) query = query.where('warehouse_id', '=', filters.warehouseId);
    if (filters.status) query = query.where('status', '=', filters.status);
    const rows = await query.orderBy('blocked_at', 'desc').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<BlockedStockEntry | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('blocked_stock_entries')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateBlockedStockProps, blockedBy?: string): Promise<BlockedStockEntry> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('blocked_stock_entries')
      .values({
        product_id: props.productId,
        warehouse_id: props.warehouseId,
        rack_id: props.rackId ?? null,
        location_id: props.locationId ?? null,
        batch_id: props.batchId ?? null,
        quantity: props.quantity,
        reason: props.reason,
        status: 'blocked',
        blocked_by: blockedBy ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async release(id: string, releasedBy?: string): Promise<BlockedStockEntry | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('blocked_stock_entries')
      .set({ status: 'released', released_by: releasedBy ?? null, released_at: new Date().toISOString() })
      .where('id', '=', id)
      .where('status', '=', 'blocked')
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }
}
