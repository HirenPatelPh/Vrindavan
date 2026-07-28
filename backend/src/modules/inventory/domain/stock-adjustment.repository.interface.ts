import { CreateStockAdjustmentProps, StockAdjustment } from './stock-adjustment.entity';

export const STOCK_ADJUSTMENT_REPOSITORY = Symbol('STOCK_ADJUSTMENT_REPOSITORY');

export interface IStockAdjustmentRepository {
  findAll(): Promise<StockAdjustment[]>;
  findById(id: string): Promise<StockAdjustment | null>;
  createWithLines(props: CreateStockAdjustmentProps, createdBy?: string): Promise<StockAdjustment>;
  /** Throws DocumentNotFoundError / DocumentNotDraftError. Recomputes each line's diff against the LIVE balance at approval time, not the system_quantity snapshot captured at creation. */
  approve(id: string, approvedBy?: string): Promise<StockAdjustment>;
  delete(id: string): Promise<boolean>;
}
