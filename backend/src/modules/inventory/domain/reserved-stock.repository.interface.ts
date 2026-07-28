import { CreateReservedStockProps, ReservedStockEntry, ReservedStockFilters } from './reserved-stock.entity';

export const RESERVED_STOCK_REPOSITORY = Symbol('RESERVED_STOCK_REPOSITORY');

export interface IReservedStockRepository {
  findAll(filters: ReservedStockFilters): Promise<ReservedStockEntry[]>;
  findById(id: string): Promise<ReservedStockEntry | null>;
  /** Insert alone is enough — Phase 1's trg_reserved_stock_to_balance increments stock_balances.reserved_quantity. */
  create(props: CreateReservedStockProps, reservedBy?: string): Promise<ReservedStockEntry>;
  /** Early manual release (before expiry). Automatic expiry is a separate scheduled-job concern (fn_release_expired_reservations, out of scope here). */
  release(id: string): Promise<ReservedStockEntry | null>;
}
