export class OutstandingReceivableRow {
  constructor(
    public readonly salesInvoiceId: string,
    public readonly invoiceNumber: string,
    public readonly invoiceDate: Date,
    public readonly dueDate: Date | null,
    public readonly customerId: string,
    public readonly customerName: string,
    public readonly totalAmount: number,
    public readonly paidAmount: number,
    public readonly outstandingAmount: number,
    public readonly daysOverdue: number,
  ) {}
}

export interface OutstandingReceivableFilters {
  customerId?: string;
}
