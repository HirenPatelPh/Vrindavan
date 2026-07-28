import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalesReturnProps, SalesReturn } from '../domain/sales-return.entity';
import { ISalesReturnRepository, SALES_RETURN_REPOSITORY } from '../domain/sales-return.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';

@Injectable()
export class SalesReturnsService {
  constructor(
    @Inject(SALES_RETURN_REPOSITORY) private readonly salesReturnRepository: ISalesReturnRepository,
  ) {}

  list(): Promise<SalesReturn[]> {
    return this.salesReturnRepository.findAll();
  }

  async getById(id: string): Promise<SalesReturn> {
    const ret = await this.salesReturnRepository.findById(id);
    if (!ret) throw new NotFoundException(`Sales return ${id} not found`);
    return ret;
  }

  create(props: CreateSalesReturnProps, createdBy?: string): Promise<SalesReturn> {
    return this.salesReturnRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<SalesReturn> {
    try {
      return await this.salesReturnRepository.approve(id, approvedBy);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.salesReturnRepository.delete(id);
    if (!deleted) throw new ConflictException(`Sales return ${id} not found, or not in draft status`);
  }
}
