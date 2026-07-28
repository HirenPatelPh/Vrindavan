import { CreateSalesReturnProps, SalesReturn } from './sales-return.entity';

export const SALES_RETURN_REPOSITORY = Symbol('SALES_RETURN_REPOSITORY');

export interface ISalesReturnRepository {
  findAll(): Promise<SalesReturn[]>;
  findById(id: string): Promise<SalesReturn | null>;
  createWithLines(props: CreateSalesReturnProps, createdBy?: string): Promise<SalesReturn>;
  /** draft -> approved. Posts return_in per line (increases our stock) at live average cost, falling back to products.purchasePrice — never the line's own refund rate. Throws DocumentNotFoundError/DocumentNotDraftError. */
  approve(id: string, approvedBy?: string): Promise<SalesReturn>;
  delete(id: string): Promise<boolean>;
}
