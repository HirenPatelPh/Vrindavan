import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalesInvoiceProps, SalesInvoice } from '../domain/sales-invoice.entity';
import { ISalesInvoiceRepository, SALES_INVOICE_REPOSITORY } from '../domain/sales-invoice.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';

@Injectable()
export class SalesInvoicesService {
  constructor(
    @Inject(SALES_INVOICE_REPOSITORY) private readonly salesInvoiceRepository: ISalesInvoiceRepository,
  ) {}

  list(): Promise<SalesInvoice[]> {
    return this.salesInvoiceRepository.findAll();
  }

  async getById(id: string): Promise<SalesInvoice> {
    const invoice = await this.salesInvoiceRepository.findById(id);
    if (!invoice) throw new NotFoundException(`Sales invoice ${id} not found`);
    return invoice;
  }

  create(props: CreateSalesInvoiceProps, createdBy?: string): Promise<SalesInvoice> {
    return this.salesInvoiceRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<SalesInvoice> {
    try {
      return await this.salesInvoiceRepository.approve(id, approvedBy);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.salesInvoiceRepository.delete(id);
    if (!deleted) throw new ConflictException(`Sales invoice ${id} not found, or not in draft status`);
  }
}
