import { CreateStockReturnProps, StockReturn } from './stock-return.entity';

export const STOCK_RETURN_REPOSITORY = Symbol('STOCK_RETURN_REPOSITORY');

export interface IStockReturnRepository {
  findAll(): Promise<StockReturn[]>;
  findById(id: string): Promise<StockReturn | null>;
  createWithLines(props: CreateStockReturnProps, createdBy?: string): Promise<StockReturn>;
  /** Throws DocumentNotFoundError / DocumentNotDraftError. unit_cost = live average_cost if a balance already exists, else falls back to products.purchase_price. */
  approve(id: string, approvedBy?: string): Promise<StockReturn>;
  delete(id: string): Promise<boolean>;
}
