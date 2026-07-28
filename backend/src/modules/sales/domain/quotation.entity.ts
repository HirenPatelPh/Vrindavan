export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export class QuotationLine {
  constructor(
    public readonly id: string,
    public readonly quotationId: string,
    public readonly productId: string,
    public readonly productUnitId: string,
    public readonly quantity: number,
    public readonly rate: number,
    public readonly discountPercent: number,
    public readonly gstId: string | null,
    public readonly lineTotal: number,
  ) {}
}

export class Quotation {
  constructor(
    public readonly id: string,
    public readonly quotationNumber: string,
    public readonly quotationDate: Date,
    public readonly customerId: string,
    public readonly validUntil: Date | null,
    public readonly status: QuotationStatus,
    public readonly remarks: string | null,
    public readonly totalAmount: number,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: QuotationLine[],
  ) {}
}

export interface CreateQuotationLineProps {
  productId: string;
  productUnitId: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstId?: string;
}

export interface CreateQuotationProps {
  customerId: string;
  quotationDate?: string;
  validUntil?: string;
  remarks?: string;
  lines: CreateQuotationLineProps[];
}
