import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockReturnProps, StockReturn } from '../domain/stock-return.entity';
import { IStockReturnRepository, STOCK_RETURN_REPOSITORY } from '../domain/stock-return.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';

@Injectable()
export class StockReturnsService {
  constructor(@Inject(STOCK_RETURN_REPOSITORY) private readonly stockReturnRepository: IStockReturnRepository) {}

  list(): Promise<StockReturn[]> {
    return this.stockReturnRepository.findAll();
  }

  async getById(id: string): Promise<StockReturn> {
    const stockReturn = await this.stockReturnRepository.findById(id);
    if (!stockReturn) throw new NotFoundException(`Stock return ${id} not found`);
    return stockReturn;
  }

  create(props: CreateStockReturnProps, createdBy?: string): Promise<StockReturn> {
    return this.stockReturnRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<StockReturn> {
    try {
      return await this.stockReturnRepository.approve(id, approvedBy);
    } catch (err) {
      if (err instanceof DocumentNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof DocumentNotDraftError) throw new ConflictException(err.message);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.stockReturnRepository.delete(id);
    if (!deleted) throw new ConflictException(`Stock return ${id} not found, or not in draft status`);
  }
}
