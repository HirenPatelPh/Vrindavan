import { BlockedStockEntry, BlockedStockFilters, CreateBlockedStockProps } from './blocked-stock.entity';

export const BLOCKED_STOCK_REPOSITORY = Symbol('BLOCKED_STOCK_REPOSITORY');

export interface IBlockedStockRepository {
  findAll(filters: BlockedStockFilters): Promise<BlockedStockEntry[]>;
  findById(id: string): Promise<BlockedStockEntry | null>;
  /** Insert alone is enough — Phase 1's trg_blocked_stock_to_balance increments stock_balances.blocked_quantity. */
  create(props: CreateBlockedStockProps, blockedBy?: string): Promise<BlockedStockEntry>;
  /** Status flip alone is enough — the same trigger decrements blocked_quantity on blocked->released. */
  release(id: string, releasedBy?: string): Promise<BlockedStockEntry | null>;
}
