import { CreatePurchaseReturnProps, PurchaseReturn } from './purchase-return.entity';

export const PURCHASE_RETURN_REPOSITORY = Symbol('PURCHASE_RETURN_REPOSITORY');

export interface IPurchaseReturnRepository {
  findAll(): Promise<PurchaseReturn[]>;
  findById(id: string): Promise<PurchaseReturn | null>;
  createWithLines(props: CreatePurchaseReturnProps, createdBy?: string): Promise<PurchaseReturn>;
  /** draft -> approved. Posts return_out per line (reduces our stock). Throws DocumentNotFoundError/DocumentNotDraftError. */
  approve(id: string, approvedBy?: string): Promise<PurchaseReturn>;
  delete(id: string): Promise<boolean>;
}
