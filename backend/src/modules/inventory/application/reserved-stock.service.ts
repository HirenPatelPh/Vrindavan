import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservedStockProps, ReservedStockEntry, ReservedStockFilters } from '../domain/reserved-stock.entity';
import { IReservedStockRepository, RESERVED_STOCK_REPOSITORY } from '../domain/reserved-stock.repository.interface';

@Injectable()
export class ReservedStockService {
  constructor(
    @Inject(RESERVED_STOCK_REPOSITORY) private readonly reservedStockRepository: IReservedStockRepository,
  ) {}

  list(filters: ReservedStockFilters): Promise<ReservedStockEntry[]> {
    return this.reservedStockRepository.findAll(filters);
  }

  async getById(id: string): Promise<ReservedStockEntry> {
    const entry = await this.reservedStockRepository.findById(id);
    if (!entry) throw new NotFoundException(`Reserved stock entry ${id} not found`);
    return entry;
  }

  create(props: CreateReservedStockProps, reservedBy?: string): Promise<ReservedStockEntry> {
    return this.reservedStockRepository.create(props, reservedBy);
  }

  async release(id: string): Promise<ReservedStockEntry> {
    const updated = await this.reservedStockRepository.release(id);
    if (!updated) throw new ConflictException(`Reserved stock entry ${id} not found, or already released`);
    return updated;
  }
}
