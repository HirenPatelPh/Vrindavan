import { CreateSalesOrderProps, SalesOrder } from './sales-order.entity';

export const SALES_ORDER_REPOSITORY = Symbol('SALES_ORDER_REPOSITORY');

export interface ISalesOrderRepository {
  findAll(): Promise<SalesOrder[]>;
  findById(id: string): Promise<SalesOrder | null>;
  createWithLines(props: CreateSalesOrderProps, createdBy?: string): Promise<SalesOrder>;
  /** draft -> approved. No stock effect. Throws DocumentNotFoundError/DocumentNotDraftError. */
  approve(id: string, approvedBy?: string): Promise<SalesOrder>;
  /** draft|approved -> cancelled. Throws DocumentNotFoundError, or DocumentNotDraftError-shaped error if partially_delivered/completed. */
  cancel(id: string): Promise<SalesOrder>;
  delete(id: string): Promise<boolean>;
}
