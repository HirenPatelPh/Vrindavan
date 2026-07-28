import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { StockLedger } from '../../../infrastructure/database/kysely/db.types';
import { StockLedgerEntry, StockLedgerFilters } from '../domain/stock-ledger.entity';
import { IStockLedgerRepository } from '../domain/stock-ledger.repository.interface';
import { MovementType } from './stock-posting.helper';

type Row = Selectable<StockLedger>;

function toDomain(row: Row): StockLedgerEntry {
  return new StockLedgerEntry(
    row.id,
    row.product_id,
    row.warehouse_id,
    row.rack_id,
    row.location_id,
    row.batch_id,
    row.movement_type as MovementType,
    Number(row.qty_in),
    Number(row.qty_out),
    Number(row.unit_cost),
    row.reference_type,
    row.reference_id,
    row.reference_line_id,
    row.remarks,
    row.created_by,
    row.created_at,
  );
}

@Injectable()
export class StockLedgerKyselyRepository implements IStockLedgerRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(filters: StockLedgerFilters): Promise<StockLedgerEntry[]> {
    let query = this.tenantDb.getDb().selectFrom('stock_ledger').selectAll();
    if (filters.productId) query = query.where('product_id', '=', filters.productId);
    if (filters.warehouseId) query = query.where('warehouse_id', '=', filters.warehouseId);
    const rows = await query
      .orderBy('created_at', 'desc')
      .limit(Math.min(Math.max(filters.limit ?? 100, 1), 500))
      .execute();
    return rows.map(toDomain);
  }

  async hasOpeningStockBeenPosted(productId: string): Promise<boolean> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('stock_ledger')
      .select('id')
      .where('movement_type', '=', 'opening_stock')
      .where('reference_type', '=', 'product')
      .where('reference_id', '=', productId)
      .executeTakeFirst();
    return row !== undefined;
  }
}
