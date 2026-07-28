export type StockTransferStatus = 'draft' | 'in_transit' | 'completed' | 'cancelled';

export class StockTransferLine {
  constructor(
    public readonly id: string,
    public readonly transferId: string,
    public readonly productId: string,
    public readonly batchId: string | null,
    public readonly fromRackId: string | null,
    public readonly fromLocationId: string | null,
    public readonly toRackId: string | null,
    public readonly toLocationId: string | null,
    public readonly quantity: number,
  ) {}
}

export class StockTransfer {
  constructor(
    public readonly id: string,
    public readonly transferNumber: string,
    public readonly transferDate: Date,
    public readonly fromWarehouseId: string,
    public readonly toWarehouseId: string,
    public readonly status: StockTransferStatus,
    public readonly remarks: string | null,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: StockTransferLine[],
  ) {}
}

export interface CreateStockTransferLineProps {
  productId: string;
  batchId?: string;
  fromRackId?: string;
  fromLocationId?: string;
  toRackId?: string;
  toLocationId?: string;
  quantity: number;
}

export interface CreateStockTransferProps {
  fromWarehouseId: string;
  toWarehouseId: string;
  transferDate?: string;
  remarks?: string;
  lines: CreateStockTransferLineProps[];
}
