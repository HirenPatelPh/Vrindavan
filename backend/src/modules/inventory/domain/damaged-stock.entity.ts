export type DamagedStockStatus = 'draft' | 'approved' | 'cancelled';

export class DamagedStockLine {
  constructor(
    public readonly id: string,
    public readonly damageId: string,
    public readonly productId: string,
    public readonly batchId: string | null,
    public readonly rackId: string | null,
    public readonly locationId: string | null,
    public readonly quantity: number,
    public readonly remarks: string | null,
  ) {}
}

export class DamagedStock {
  constructor(
    public readonly id: string,
    public readonly damageNumber: string,
    public readonly damageDate: Date,
    public readonly warehouseId: string,
    public readonly reason: string | null,
    public readonly status: DamagedStockStatus,
    public readonly createdBy: string | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: DamagedStockLine[],
  ) {}
}

export interface CreateDamagedStockLineProps {
  productId: string;
  batchId?: string;
  rackId?: string;
  locationId?: string;
  quantity: number;
  remarks?: string;
}

export interface CreateDamagedStockProps {
  warehouseId: string;
  damageDate?: string;
  reason?: string;
  lines: CreateDamagedStockLineProps[];
}
