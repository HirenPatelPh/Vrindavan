import { StockLedgerEntry, StockLedgerFilters } from './stock-ledger.entity';

export const STOCK_LEDGER_REPOSITORY = Symbol('STOCK_LEDGER_REPOSITORY');

export interface IStockLedgerRepository {
  findAll(filters: StockLedgerFilters): Promise<StockLedgerEntry[]>;
  /** Used by the opening-stock endpoint to prevent double-posting. */
  hasOpeningStockBeenPosted(productId: string): Promise<boolean>;
}
