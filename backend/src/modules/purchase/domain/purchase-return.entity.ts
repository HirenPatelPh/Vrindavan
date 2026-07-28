export type PurchaseReturnStatus = 'draft' | 'approved' | 'cancelled';

export class PurchaseReturnLine {
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

export class PurchaseReturn {
  constructor(
    public readonly id: string,
    public readonly returnNumber: string,
    public readonly returnDate: Date,
    public readonly supplierId: string,
    public readonly purchaseInvoiceId: string | null,
    public readonly warehouseId: string,
    public readonly reason: string | null,
    public readonly status: PurchaseReturnStatus,
    public readonly totalAmount: number,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: PurchaseReturnLine[],
  ) {}
}

export interface CreatePurchaseReturnLineProps {
  productId: string;
  batchId?: string;
  quantity: number;
  rate: number;
}

export interface CreatePurchaseReturnProps {
  supplierId: string;
  warehouseId: string;
  purchaseInvoiceId?: string;
  returnDate?: string;
  reason?: string;
  lines: CreatePurchaseReturnLineProps[];
}
