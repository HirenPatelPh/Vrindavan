import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BlockedStockEntry, BlockedStockFilters, CreateBlockedStockProps } from '../domain/blocked-stock.entity';
import { BLOCKED_STOCK_REPOSITORY, IBlockedStockRepository } from '../domain/blocked-stock.repository.interface';

@Injectable()
export class BlockedStockService {
  constructor(@Inject(BLOCKED_STOCK_REPOSITORY) private readonly blockedStockRepository: IBlockedStockRepository) {}

  list(filters: BlockedStockFilters): Promise<BlockedStockEntry[]> {
    return this.blockedStockRepository.findAll(filters);
  }

  async getById(id: string): Promise<BlockedStockEntry> {
    const entry = await this.blockedStockRepository.findById(id);
    if (!entry) throw new NotFoundException(`Blocked stock entry ${id} not found`);
    return entry;
  }

  create(props: CreateBlockedStockProps, blockedBy?: string): Promise<BlockedStockEntry> {
    return this.blockedStockRepository.create(props, blockedBy);
  }

  async release(id: string, releasedBy?: string): Promise<BlockedStockEntry> {
    const updated = await this.blockedStockRepository.release(id, releasedBy);
    if (!updated) throw new ConflictException(`Blocked stock entry ${id} not found, or already released`);
    return updated;
  }
}
