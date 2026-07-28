import { CreatePurchaseInvoiceProps, PurchaseInvoice } from './purchase-invoice.entity';

export const PURCHASE_INVOICE_REPOSITORY = Symbol('PURCHASE_INVOICE_REPOSITORY');

export interface IPurchaseInvoiceRepository {
  findAll(): Promise<PurchaseInvoice[]>;
  findById(id: string): Promise<PurchaseInvoice | null>;
  createWithLines(props: CreatePurchaseInvoiceProps, createdBy?: string): Promise<PurchaseInvoice>;
  /** draft -> approved. No stock effect. Throws DocumentNotFoundError/DocumentNotDraftError. */
  approve(id: string, approvedBy?: string): Promise<PurchaseInvoice>;
  delete(id: string): Promise<boolean>;
}
