export type StockAdjustmentStatus = 'draft' | 'approved' | 'cancelled';

export class StockAdjustmentLine {
  constructor(
    public readonly id: string,
    public readonly adjustmentId: string,
    public readonly productId: string,
    public readonly batchId: string | null,
    public readonly rackId: string | null,
    public readonly locationId: string | null,
    public readonly systemQuantity: number,
    public readonly adjustedQuantity: number,
    public readonly remarks: string | null,
  ) {}
}

export class StockAdjustment {
  constructor(
    public readonly id: string,
    public readonly adjustmentNumber: string,
    public readonly adjustmentDate: Date,
    public readonly warehouseId: string,
    public readonly reason: string | null,
    public readonly status: StockAdjustmentStatus,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: StockAdjustmentLine[],
  ) {}
}

export interface CreateStockAdjustmentLineProps {
  productId: string;
  batchId?: string;
  rackId?: string;
  locationId?: string;
  /** The target/counted quantity the adjustment should result in. system_quantity (a live-balance snapshot) is captured automatically, not client-supplied. */
  adjustedQuantity: number;
  remarks?: string;
}

export interface CreateStockAdjustmentProps {
  warehouseId: string;
  adjustmentDate?: string;
  reason?: string;
  lines: CreateStockAdjustmentLineProps[];
}
