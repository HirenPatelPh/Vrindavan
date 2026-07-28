import { CreatePurchaseOrderProps, PurchaseOrder } from './purchase-order.entity';

export const PURCHASE_ORDER_REPOSITORY = Symbol('PURCHASE_ORDER_REPOSITORY');

export interface IPurchaseOrderRepository {
  findAll(): Promise<PurchaseOrder[]>;
  findById(id: string): Promise<PurchaseOrder | null>;
  createWithLines(props: CreatePurchaseOrderProps, createdBy?: string): Promise<PurchaseOrder>;
  /** draft -> approved. No stock effect — only GRNs move stock. Throws DocumentNotFoundError/DocumentNotDraftError. */
  approve(id: string, approvedBy?: string): Promise<PurchaseOrder>;
  /** draft|approved -> cancelled. Throws DocumentNotFoundError, or DocumentNotDraftError-shaped error if partially_received/completed. */
  cancel(id: string): Promise<PurchaseOrder>;
  delete(id: string): Promise<boolean>;
}
