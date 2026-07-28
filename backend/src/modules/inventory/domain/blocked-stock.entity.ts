export type BlockedStockStatus = 'blocked' | 'released';

export class BlockedStockEntry {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly warehouseId: string,
    public readonly rackId: string | null,
    public readonly locationId: string | null,
    public readonly batchId: string | null,
    public readonly quantity: number,
    public readonly reason: string,
    public readonly status: BlockedStockStatus,
    public readonly blockedBy: string | null,
    public readonly blockedAt: Date,
    public readonly releasedBy: string | null,
    public readonly releasedAt: Date | null,
  ) {}
}

export interface CreateBlockedStockProps {
  productId: string;
  warehouseId: string;
  rackId?: string;
  locationId?: string;
  batchId?: string;
  quantity: number;
  reason: string;
}

export interface BlockedStockFilters {
  productId?: string;
  warehouseId?: string;
  status?: BlockedStockStatus;
}
