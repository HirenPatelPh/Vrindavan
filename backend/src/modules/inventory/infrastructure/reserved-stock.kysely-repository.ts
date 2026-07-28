import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { ReservedStock } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateReservedStockProps,
  ReservedStockEntry,
  ReservedStockFilters,
  ReservedStockStatus,
} from '../domain/reserved-stock.entity';
import { IReservedStockRepository } from '../domain/reserved-stock.repository.interface';

type Row = Selectable<ReservedStock>;

function toDomain(row: Row): ReservedStockEntry {
  return new ReservedStockEntry(
    row.id,
    row.product_id,
    row.warehouse_id,
    row.batch_id,
    Number(row.quantity),
    row.reference_type,
    row.reference_id,
    row.reserved_by,
    row.reserved_at,
    row.expires_at,
    row.status as ReservedStockStatus,
    row.released_at,
  );
}

@Injectable()
export class ReservedStockKyselyRepository implements IReservedStockRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(filters: ReservedStockFilters): Promise<ReservedStockEntry[]> {
    let query = this.tenantDb.getDb().selectFrom('reserved_stock').selectAll();
    if (filters.productId) query = query.where('product_id', '=', filters.productId);
    if (filters.warehouseId) query = query.where('warehouse_id', '=', filters.warehouseId);
    if (filters.status) query = query.where('status', '=', filters.status);
    const rows = await query.orderBy('reserved_at', 'desc').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<ReservedStockEntry | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('reserved_stock')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateReservedStockProps, reservedBy?: string): Promise<ReservedStockEntry> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('reserved_stock')
      .values({
        product_id: props.productId,
        warehouse_id: props.warehouseId,
        batch_id: props.batchId ?? null,
        quantity: props.quantity,
        reference_type: props.referenceType,
        reference_id: props.referenceId,
        expires_at: new Date(props.expiresAt).toISOString(),
        reserved_by: reservedBy ?? null,
        status: 'active',
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async release(id: string): Promise<ReservedStockEntry | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('reserved_stock')
      .set({ status: 'released', released_at: new Date().toISOString() })
      .where('id', '=', id)
      .where('status', '=', 'active')
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }
}
