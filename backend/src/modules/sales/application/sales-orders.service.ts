import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalesOrderProps, SalesOrder } from '../domain/sales-order.entity';
import { ISalesOrderRepository, SALES_ORDER_REPOSITORY } from '../domain/sales-order.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';

@Injectable()
export class SalesOrdersService {
  constructor(@Inject(SALES_ORDER_REPOSITORY) private readonly salesOrderRepository: ISalesOrderRepository) {}

  list(): Promise<SalesOrder[]> {
    return this.salesOrderRepository.findAll();
  }

  async getById(id: string): Promise<SalesOrder> {
    const so = await this.salesOrderRepository.findById(id);
    if (!so) throw new NotFoundException(`Sales order ${id} not found`);
    return so;
  }

  create(props: CreateSalesOrderProps, createdBy?: string): Promise<SalesOrder> {
    return this.salesOrderRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<SalesOrder> {
    try {
      return await this.salesOrderRepository.approve(id, approvedBy);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async cancel(id: string): Promise<SalesOrder> {
    try {
      return await this.salesOrderRepository.cancel(id);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.salesOrderRepository.delete(id);
    if (!deleted) throw new ConflictException(`Sales order ${id} not found, or not in draft status`);
  }
}
