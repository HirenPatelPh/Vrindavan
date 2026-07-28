import { CreateCustomerPaymentProps, CustomerPayment } from './customer-payment.entity';

export const CUSTOMER_PAYMENT_REPOSITORY = Symbol('CUSTOMER_PAYMENT_REPOSITORY');

export interface ICustomerPaymentRepository {
  findAll(): Promise<CustomerPayment[]>;
  findById(id: string): Promise<CustomerPayment | null>;
  /**
   * Direct-entry, no draft/approve — same shape as Blocked/Reserved Stock (Phase 5c). One
   * transaction: insert the payment, then per allocation validate + insert + update the
   * invoice's paid_amount/status. Throws InvalidAllocationError for a bad allocation.
   */
  createWithAllocations(props: CreateCustomerPaymentProps, createdBy?: string): Promise<CustomerPayment>;
}
