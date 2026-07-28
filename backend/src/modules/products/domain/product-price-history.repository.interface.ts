import { ProductPriceHistoryEntry } from './product-price-history.entity';

export const PRODUCT_PRICE_HISTORY_REPOSITORY = Symbol('PRODUCT_PRICE_HISTORY_REPOSITORY');

/**
 * Read-only: rows are written exclusively by Phase 1's existing trg_products_price_history
 * trigger (fires on products.purchase_price/selling_price/mrp UPDATE) — never by application code.
 */
export interface IProductPriceHistoryRepository {
  findAllByProduct(productId: string): Promise<ProductPriceHistoryEntry[]>;
}
