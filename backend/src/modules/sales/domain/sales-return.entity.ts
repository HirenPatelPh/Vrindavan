export type SalesReturnStatus = 'draft' | 'approved' | 'cancelled';

export class SalesReturnLine {
  constructor(
    public readonly id: string,
    public readonly returnId: string,
    public readonly productId: string,
    public readonly batchId: string | null,
    public readonly quantity: number,
    public readonly rate: number,
    public readonly lineTotal: number,
  ) {}
}

export class SalesReturn {
  constructor(
    public readonly id: string,
    public readonly returnNumber: string,
    public readonly returnDate: Date,
    public readonly customerId: string,
    public readonly salesInvoiceId: string | null,
    public readonly warehouseId: string,
    public readonly reason: string | null,
    public readonly status: SalesReturnStatus,
    public readonly totalAmount: number,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: SalesReturnLine[],
  ) {}
}

export interface CreateSalesReturnLineProps {
  productId: string;
  batchId?: string;
  quantity: number;
  /** The refund/sale price for this line — used only for total_amount, never as the posted inventory unit_cost. See Phase 7 plan's cost nuance. */
  rate: number;
}

export interface CreateSalesReturnProps {
  customerId: string;
  warehouseId: string;
  salesInvoiceId?: string;
  returnDate?: string;
  reason?: string;
  lines: CreateSalesReturnLineProps[];
}
