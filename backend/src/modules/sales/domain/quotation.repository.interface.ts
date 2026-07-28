import { CreateQuotationProps, Quotation } from './quotation.entity';
import { SalesOrder } from './sales-order.entity';

export const QUOTATION_REPOSITORY = Symbol('QUOTATION_REPOSITORY');

export interface IQuotationRepository {
  findAll(): Promise<Quotation[]>;
  findById(id: string): Promise<Quotation | null>;
  createWithLines(props: CreateQuotationProps, createdBy?: string): Promise<Quotation>;
  /** draft -> sent. Throws DocumentNotFoundError/DocumentNotDraftError-shaped error if not draft. */
  send(id: string): Promise<Quotation>;
  /** sent -> accepted. */
  accept(id: string): Promise<Quotation>;
  /** sent -> rejected. */
  reject(id: string): Promise<Quotation>;
  /**
   * accepted -> converted. Creates a new Sales Order copying this quotation's customer + lines
   * verbatim (no tax recomputation — the quotation's own line_total/total_amount are already
   * correct for the identical product/rate/discount/gst combination), for the client-supplied
   * warehouseId (quotations have no warehouse of their own). One transaction.
   */
  convertToSalesOrder(id: string, warehouseId: string, createdBy?: string): Promise<SalesOrder>;
  delete(id: string): Promise<boolean>;
}
