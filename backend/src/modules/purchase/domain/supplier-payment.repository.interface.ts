import { CreateSupplierPaymentProps, SupplierPayment } from './supplier-payment.entity';

export const SUPPLIER_PAYMENT_REPOSITORY = Symbol('SUPPLIER_PAYMENT_REPOSITORY');

export interface ISupplierPaymentRepository {
  findAll(): Promise<SupplierPayment[]>;
  findById(id: string): Promise<SupplierPayment | null>;
  /**
   * Direct-entry, no draft/approve — same shape as Blocked/Reserved Stock (Phase 5c). One
   * transaction: insert the payment, then per allocation validate + insert + update the
   * invoice's paid_amount/status. Throws InvalidAllocationError for a bad allocation.
   */
  createWithAllocations(props: CreateSupplierPaymentProps, createdBy?: string): Promise<SupplierPayment>;
}
