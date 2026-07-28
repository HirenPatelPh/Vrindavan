import { MovementType } from '../infrastructure/stock-posting.helper';

export class StockLedgerEntry {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly warehouseId: string,
    public readonly rackId: string | null,
    public readonly locationId: string | null,
    public readonly batchId: string | null,
    public readonly movementType: MovementType,
    public readonly qtyIn: number,
    public readonly qtyOut: number,
    public readonly unitCost: number,
    public readonly referenceType: string,
    public readonly referenceId: string,
    public readonly referenceLineId: string | null,
    public readonly remarks: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
  ) {}
}

export interface StockLedgerFilters {
  productId?: string;
  warehouseId?: string;
  limit?: number;
}
