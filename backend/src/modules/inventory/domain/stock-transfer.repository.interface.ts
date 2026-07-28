import { CreateStockTransferProps, StockTransfer } from './stock-transfer.entity';

export const STOCK_TRANSFER_REPOSITORY = Symbol('STOCK_TRANSFER_REPOSITORY');

export interface IStockTransferRepository {
  findAll(): Promise<StockTransfer[]>;
  findById(id: string): Promise<StockTransfer | null>;
  createWithLines(props: CreateStockTransferProps, createdBy?: string): Promise<StockTransfer>;
  /** Throws DocumentNotFoundError / DocumentNotDraftError (see domain/inventory-document.errors.ts). */
  approve(id: string, approvedBy?: string): Promise<StockTransfer>;
  delete(id: string): Promise<boolean>;
}
