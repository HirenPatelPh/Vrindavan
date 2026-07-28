import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockAdjustmentProps, StockAdjustment } from '../domain/stock-adjustment.entity';
import {
  IStockAdjustmentRepository,
  STOCK_ADJUSTMENT_REPOSITORY,
} from '../domain/stock-adjustment.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';

@Injectable()
export class StockAdjustmentsService {
  constructor(
    @Inject(STOCK_ADJUSTMENT_REPOSITORY) private readonly stockAdjustmentRepository: IStockAdjustmentRepository,
  ) {}

  list(): Promise<StockAdjustment[]> {
    return this.stockAdjustmentRepository.findAll();
  }

  async getById(id: string): Promise<StockAdjustment> {
    const adjustment = await this.stockAdjustmentRepository.findById(id);
    if (!adjustment) throw new NotFoundException(`Stock adjustment ${id} not found`);
    return adjustment;
  }

  create(props: CreateStockAdjustmentProps, createdBy?: string): Promise<StockAdjustment> {
    return this.stockAdjustmentRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<StockAdjustment> {
    try {
      return await this.stockAdjustmentRepository.approve(id, approvedBy);
    } catch (err) {
      if (err instanceof DocumentNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof DocumentNotDraftError) throw new ConflictException(err.message);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.stockAdjustmentRepository.delete(id);
    if (!deleted) throw new ConflictException(`Stock adjustment ${id} not found, or not in draft status`);
  }
}
