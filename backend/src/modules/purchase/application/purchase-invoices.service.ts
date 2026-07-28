import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseInvoiceProps, PurchaseInvoice } from '../domain/purchase-invoice.entity';
import {
  IPurchaseInvoiceRepository,
  PURCHASE_INVOICE_REPOSITORY,
} from '../domain/purchase-invoice.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/purchase-document.errors';

@Injectable()
export class PurchaseInvoicesService {
  constructor(
    @Inject(PURCHASE_INVOICE_REPOSITORY) private readonly purchaseInvoiceRepository: IPurchaseInvoiceRepository,
  ) {}

  list(): Promise<PurchaseInvoice[]> {
    return this.purchaseInvoiceRepository.findAll();
  }

  async getById(id: string): Promise<PurchaseInvoice> {
    const invoice = await this.purchaseInvoiceRepository.findById(id);
    if (!invoice) throw new NotFoundException(`Purchase invoice ${id} not found`);
    return invoice;
  }

  create(props: CreatePurchaseInvoiceProps, createdBy?: string): Promise<PurchaseInvoice> {
    return this.purchaseInvoiceRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<PurchaseInvoice> {
    try {
      return await this.purchaseInvoiceRepository.approve(id, approvedBy);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.purchaseInvoiceRepository.delete(id);
    if (!deleted) throw new ConflictException(`Purchase invoice ${id} not found, or not in draft status`);
  }
}
