export type SalesInvoiceStatus = 'draft' | 'approved' | 'partially_paid' | 'paid' | 'cancelled';

export class SalesInvoiceLine {
  constructor(
    public readonly id: string,
    public readonly invoiceId: string,
    public readonly productId: string,
    public readonly productUnitId: string,
    public readonly batchId: string | null,
    public readonly quantity: number,
    public readonly rate: number,
    public readonly discountPercent: number,
    public readonly gstId: string | null,
    public readonly taxAmount: number,
    public readonly lineTotal: number,
  ) {}
}

export class SalesInvoice {
  constructor(
    public readonly id: string,
    public readonly invoiceNumber: string,
    public readonly invoiceDate: Date,
    public readonly dcId: string | null,
    public readonly soId: string | null,
    public readonly customerId: string,
    public readonly financialYearId: string,
    public readonly dueDate: Date | null,
    public readonly status: SalesInvoiceStatus,
    public readonly subtotal: number,
    public readonly taxAmount: number,
    public readonly discountAmount: number,
    public readonly totalAmount: number,
    public readonly paidAmount: number,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: SalesInvoiceLine[],
  ) {}
}

export interface CreateSalesInvoiceLineProps {
  productId: string;
  productUnitId: string;
  batchId?: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstId?: string;
}

export interface CreateSalesInvoiceProps {
  customerId: string;
  dcId?: string;
  soId?: string;
  invoiceDate?: string;
  dueDate?: string;
  discountAmount?: number;
  lines: CreateSalesInvoiceLineProps[];
}
