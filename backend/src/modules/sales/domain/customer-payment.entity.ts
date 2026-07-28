export type PaymentMode = 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'card' | 'other';

export class CustomerPaymentAllocation {
  constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly salesInvoiceId: string,
    public readonly allocatedAmount: number,
  ) {}
}

export class CustomerPayment {
  constructor(
    public readonly id: string,
    public readonly paymentNumber: string,
    public readonly paymentDate: Date,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly paymentMode: PaymentMode,
    public readonly referenceNumber: string | null,
    public readonly remarks: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public readonly allocations: CustomerPaymentAllocation[],
  ) {}
}

export interface CreateCustomerPaymentAllocationProps {
  salesInvoiceId: string;
  allocatedAmount: number;
}

export interface CreateCustomerPaymentProps {
  customerId: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate?: string;
  referenceNumber?: string;
  remarks?: string;
  allocations: CreateCustomerPaymentAllocationProps[];
}
