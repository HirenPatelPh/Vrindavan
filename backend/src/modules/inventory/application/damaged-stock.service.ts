import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDamagedStockProps, DamagedStock } from '../domain/damaged-stock.entity';
import { DAMAGED_STOCK_REPOSITORY, IDamagedStockRepository } from '../domain/damaged-stock.repository.interface';
import {
  DocumentNotDraftError,
  DocumentNotFoundError,
  InsufficientStockError,
} from '../domain/inventory-document.errors';

@Injectable()
export class DamagedStockService {
  constructor(@Inject(DAMAGED_STOCK_REPOSITORY) private readonly damagedStockRepository: IDamagedStockRepository) {}

  list(): Promise<DamagedStock[]> {
    return this.damagedStockRepository.findAll();
  }

  async getById(id: string): Promise<DamagedStock> {
    const entry = await this.damagedStockRepository.findById(id);
    if (!entry) throw new NotFoundException(`Damaged stock entry ${id} not found`);
    return entry;
  }

  create(props: CreateDamagedStockProps, createdBy?: string): Promise<DamagedStock> {
    return this.damagedStockRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<DamagedStock> {
    try {
      return await this.damagedStockRepository.approve(id, approvedBy);
    } catch (err) {
      if (err instanceof DocumentNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof DocumentNotDraftError) throw new ConflictException(err.message);
      if (err instanceof InsufficientStockError) throw new ConflictException(err.message);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.damagedStockRepository.delete(id);
    if (!deleted) throw new ConflictException(`Damaged stock entry ${id} not found, or not in draft status`);
  }
}
