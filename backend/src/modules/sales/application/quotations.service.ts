import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuotationProps, Quotation } from '../domain/quotation.entity';
import { SalesOrder } from '../domain/sales-order.entity';
import { IQuotationRepository, QUOTATION_REPOSITORY } from '../domain/quotation.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';

@Injectable()
export class QuotationsService {
  constructor(@Inject(QUOTATION_REPOSITORY) private readonly quotationRepository: IQuotationRepository) {}

  list(): Promise<Quotation[]> {
    return this.quotationRepository.findAll();
  }

  async getById(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findById(id);
    if (!quotation) throw new NotFoundException(`Quotation ${id} not found`);
    return quotation;
  }

  create(props: CreateQuotationProps, createdBy?: string): Promise<Quotation> {
    return this.quotationRepository.createWithLines(props, createdBy);
  }

  private async handle<T>(op: () => Promise<T>): Promise<T> {
    try {
      return await op();
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  send(id: string): Promise<Quotation> {
    return this.handle(() => this.quotationRepository.send(id));
  }

  accept(id: string): Promise<Quotation> {
    return this.handle(() => this.quotationRepository.accept(id));
  }

  reject(id: string): Promise<Quotation> {
    return this.handle(() => this.quotationRepository.reject(id));
  }

  convertToSalesOrder(id: string, warehouseId: string, createdBy?: string): Promise<SalesOrder> {
    return this.handle(() => this.quotationRepository.convertToSalesOrder(id, warehouseId, createdBy));
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.quotationRepository.delete(id);
    if (!deleted) throw new ConflictException(`Quotation ${id} not found, or not in draft status`);
  }
}
