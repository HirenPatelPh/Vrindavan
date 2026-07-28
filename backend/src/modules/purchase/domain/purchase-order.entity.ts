/** `pending_approval` is part of the DB CHECK constraint but unused by this app — see Phase 6 plan. */
export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_received'
  | 'completed'
  | 'cancelled';

export class PurchaseOrderLine {
  constructor(
    public readonly id: string,
    public readonly poId: string,
    public readonly productId: string,
    public readonly productUnitId: string,
    public readonly quantity: number,
    public readonly receivedQuantity: number,
    public readonly rate: number,
    public readonly discountPercent: number,
    public readonly gstId: string | null,
    public readonly lineTotal: number,
  ) {}
}

export class PurchaseOrder {
  constructor(
    public readonly id: string,
    public readonly poNumber: string,
    public readonly poDate: Date,
    public readonly supplierId: string,
    public readonly warehouseId: string,
    public readonly financialYearId: string,
    public readonly expectedDeliveryDate: Date | null,
    public readonly status: PurchaseOrderStatus,
    public readonly remarks: string | null,
    public readonly totalAmount: number,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: PurchaseOrderLine[],
  ) {}
}

export interface CreatePurchaseOrderLineProps {
  productId: string;
  productUnitId: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstId?: string;
}

export interface CreatePurchaseOrderProps {
  supplierId: string;
  warehouseId: string;
  poDate?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  lines: CreatePurchaseOrderLineProps[];
}
