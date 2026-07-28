export type PriceType = 'purchase' | 'selling' | 'mrp';

export class ProductPriceHistoryEntry {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly priceType: PriceType,
    public readonly oldPrice: number | null,
    public readonly newPrice: number,
    public readonly changedBy: string | null,
    public readonly changedAt: Date,
  ) {}
}
