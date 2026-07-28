import { CreateDamagedStockProps, DamagedStock } from './damaged-stock.entity';

export const DAMAGED_STOCK_REPOSITORY = Symbol('DAMAGED_STOCK_REPOSITORY');

export interface IDamagedStockRepository {
  findAll(): Promise<DamagedStock[]>;
  findById(id: string): Promise<DamagedStock | null>;
  createWithLines(props: CreateDamagedStockProps, createdBy?: string): Promise<DamagedStock>;
  /** Throws DocumentNotFoundError / DocumentNotDraftError. */
  approve(id: string, approvedBy?: string): Promise<DamagedStock>;
  delete(id: string): Promise<boolean>;
}
