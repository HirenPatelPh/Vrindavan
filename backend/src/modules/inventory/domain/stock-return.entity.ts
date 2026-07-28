export type StockReturnStatus = 'draft' | 'approved' | 'cancelled';

export class StockReturnLine {
  constructor(
    public readonly id: string,
    public readonly returnId: string,
    public readonly productId: string,
    public readonly batchId: string | null,
    public readonly rackId: string | null,
    public readonly locationId: string | null,
    public readonly quantity: number,
    public readonly remarks: string | null,
  ) {}
}

export class StockReturn {
  constructor(
    public readonly id: string,
    public readonly returnNumber: string,
    public readonly returnDate: Date,
    public readonly warehouseId: string,
    public readonly reason: string | null,
    public readonly status: StockReturnStatus,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: StockReturnLine[],
  ) {}
}

export interface CreateStockReturnLineProps {
  productId: string;
  batchId?: string;
  rackId?: string;
  locationId?: string;
  quantity: number;
  remarks?: string;
}

export interface CreateStockReturnProps {
  warehouseId: string;
  returnDate?: string;
  reason?: string;
  lines: CreateStockReturnLineProps[];
}
