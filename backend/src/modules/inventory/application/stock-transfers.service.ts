import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockTransferProps, StockTransfer } from '../domain/stock-transfer.entity';
import { IStockTransferRepository, STOCK_TRANSFER_REPOSITORY } from '../domain/stock-transfer.repository.interface';
import {
  DocumentNotDraftError,
  DocumentNotFoundError,
  InsufficientStockError,
} from '../domain/inventory-document.errors';

@Injectable()
export class StockTransfersService {
  constructor(@Inject(STOCK_TRANSFER_REPOSITORY) private readonly stockTransferRepository: IStockTransferRepository) {}

  list(): Promise<StockTransfer[]> {
    return this.stockTransferRepository.findAll();
  }

  async getById(id: string): Promise<StockTransfer> {
    const transfer = await this.stockTransferRepository.findById(id);
    if (!transfer) throw new NotFoundException(`Stock transfer ${id} not found`);
    return transfer;
  }

  create(props: CreateStockTransferProps, createdBy?: string): Promise<StockTransfer> {
    return this.stockTransferRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<StockTransfer> {
    try {
      return await this.stockTransferRepository.approve(id, approvedBy);
    } catch (err) {
      if (err instanceof DocumentNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof DocumentNotDraftError) throw new ConflictException(err.message);
      if (err instanceof InsufficientStockError) throw new ConflictException(err.message);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.stockTransferRepository.delete(id);
    if (!deleted) throw new ConflictException(`Stock transfer ${id} not found, or not in draft status`);
  }
}
