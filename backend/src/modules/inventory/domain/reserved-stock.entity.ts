export type ReservedStockStatus = 'active' | 'released' | 'consumed' | 'expired';

export class ReservedStockEntry {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly warehouseId: string,
    public readonly batchId: string | null,
    public readonly quantity: number,
    public readonly referenceType: string,
    public readonly referenceId: string,
    public readonly reservedBy: string | null,
    public readonly reservedAt: Date,
    public readonly expiresAt: Date,
    public readonly status: ReservedStockStatus,
    public readonly releasedAt: Date | null,
  ) {}
}

export interface CreateReservedStockProps {
  productId: string;
  warehouseId: string;
  batchId?: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  expiresAt: string;
}

export interface ReservedStockFilters {
  productId?: string;
  warehouseId?: string;
  status?: ReservedStockStatus;
}
