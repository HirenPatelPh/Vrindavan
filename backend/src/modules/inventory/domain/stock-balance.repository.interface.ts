import { CurrentStockRow, StockBalanceFilters } from './stock-balance.entity';

export const STOCK_BALANCE_REPOSITORY = Symbol('STOCK_BALANCE_REPOSITORY');

export interface IStockBalanceRepository {
  getCurrentStock(filters: StockBalanceFilters): Promise<CurrentStockRow[]>;
}
