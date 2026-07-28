import { Injectable } from '@nestjs/common';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { CurrentStockRow, StockBalanceFilters } from '../domain/stock-balance.entity';
import { IStockBalanceRepository } from '../domain/stock-balance.repository.interface';

@Injectable()
export class StockBalanceKyselyRepository implements IStockBalanceRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async getCurrentStock(filters: StockBalanceFilters): Promise<CurrentStockRow[]> {
    let query = this.tenantDb.getDb().selectFrom('v_current_stock').selectAll();
    if (filters.productId) query = query.where('product_id', '=', filters.productId);
    if (filters.warehouseId) query = query.where('warehouse_id', '=', filters.warehouseId);
    const rows = await query.execute();

    return rows
      .filter((r) => r.stock_balance_id !== null)
      .map(
        (r) =>
          new CurrentStockRow(
            r.stock_balance_id!,
            r.product_id!,
            r.product_name!,
            r.sku!,
            r.warehouse_id!,
            r.warehouse_name!,
            r.rack_name,
            r.location_name,
            r.batch_number,
            r.expiry_date,
            Number(r.quantity),
            Number(r.reserved_quantity),
            Number(r.blocked_quantity),
            Number(r.available_quantity),
            Number(r.average_cost),
            Number(r.stock_value),
          ),
      );
  }
}
