export class OutstandingPayableRow {
  constructor(
    public readonly purchaseInvoiceId: string,
    public readonly invoiceNumber: string,
    public readonly invoiceDate: Date,
    public readonly dueDate: Date | null,
    public readonly supplierId: string,
    public readonly supplierName: string,
    public readonly totalAmount: number,
    public readonly paidAmount: number,
    public readonly outstandingAmount: number,
    public readonly daysOverdue: number,
  ) {}
}

export interface OutstandingPayableFilters {
  supplierId?: string;
}
