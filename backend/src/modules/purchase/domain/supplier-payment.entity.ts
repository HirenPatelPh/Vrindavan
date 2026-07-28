export type PaymentMode = 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'card' | 'other';

export class SupplierPaymentAllocation {
  constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly purchaseInvoiceId: string,
    public readonly allocatedAmount: number,
  ) {}
}

export class SupplierPayment {
  constructor(
    public readonly id: string,
    public readonly paymentNumber: string,
    public readonly paymentDate: Date,
    public readonly supplierId: string,
    public readonly amount: number,
    public readonly paymentMode: PaymentMode,
    public readonly referenceNumber: string | null,
    public readonly remarks: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public readonly allocations: SupplierPaymentAllocation[],
  ) {}
}

export interface CreateSupplierPaymentAllocationProps {
  purchaseInvoiceId: string;
  allocatedAmount: number;
}

export interface CreateSupplierPaymentProps {
  supplierId: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate?: string;
  referenceNumber?: string;
  remarks?: string;
  allocations: CreateSupplierPaymentAllocationProps[];
}
