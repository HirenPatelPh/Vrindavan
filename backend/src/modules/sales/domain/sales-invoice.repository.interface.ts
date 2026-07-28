import { CreateSalesInvoiceProps, SalesInvoice } from './sales-invoice.entity';

export const SALES_INVOICE_REPOSITORY = Symbol('SALES_INVOICE_REPOSITORY');

export interface ISalesInvoiceRepository {
  findAll(): Promise<SalesInvoice[]>;
  findById(id: string): Promise<SalesInvoice | null>;
  createWithLines(props: CreateSalesInvoiceProps, createdBy?: string): Promise<SalesInvoice>;
  /** draft -> approved. No stock effect. Throws DocumentNotFoundError/DocumentNotDraftError. */
  approve(id: string, approvedBy?: string): Promise<SalesInvoice>;
  delete(id: string): Promise<boolean>;
}
