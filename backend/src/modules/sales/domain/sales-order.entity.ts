/** `pending_approval` is part of the DB CHECK constraint but unused by this app — see Phase 6/7 plans. */
export type SalesOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_delivered'
  | 'completed'
  | 'cancelled';

export class SalesOrderLine {
  constructor(
    public readonly id: string,
    public readonly soId: string,
    public readonly productId: string,
    public readonly productUnitId: string,
    public readonly quantity: number,
    public readonly deliveredQuantity: number,
    public readonly rate: number,
    public readonly discountPercent: number,
    public readonly gstId: string | null,
    public readonly lineTotal: number,
  ) {}
}

export class SalesOrder {
  constructor(
    public readonly id: string,
    public readonly soNumber: string,
    public readonly soDate: Date,
    public readonly customerId: string,
    public readonly quotationId: string | null,
    public readonly warehouseId: string,
    public readonly financialYearId: string,
    public readonly expectedDeliveryDate: Date | null,
    public readonly status: SalesOrderStatus,
    public readonly remarks: string | null,
    public readonly totalAmount: number,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: SalesOrderLine[],
  ) {}
}

export interface CreateSalesOrderLineProps {
  productId: string;
  productUnitId: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstId?: string;
  /** Pre-computed line_total, set only when copying verbatim from an accepted Quotation (skips recomputation — see QuotationKyselyRepository.convertToSalesOrder). Omitted on normal client-authored creation, where the repository computes it. */
  precomputedLineTotal?: number;
}

export interface CreateSalesOrderProps {
  customerId: string;
  warehouseId: string;
  quotationId?: string;
  soDate?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  lines: CreateSalesOrderLineProps[];
}
