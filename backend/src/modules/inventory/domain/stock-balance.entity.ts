export class CurrentStockRow {
  constructor(
    public readonly stockBalanceId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly sku: string,
    public readonly warehouseId: string,
    public readonly warehouseName: string,
    public readonly rackName: string | null,
    public readonly locationName: string | null,
    public readonly batchNumber: string | null,
    public readonly expiryDate: Date | null,
    public readonly quantity: number,
    public readonly reservedQuantity: number,
    public readonly blockedQuantity: number,
    public readonly availableQuantity: number,
    public readonly averageCost: number,
    public readonly stockValue: number,
  ) {}
}

export interface StockBalanceFilters {
  productId?: string;
  warehouseId?: string;
}
