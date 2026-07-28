import { ApiProperty } from '@nestjs/swagger';
import { PriceType, ProductPriceHistoryEntry } from '../../domain/product-price-history.entity';

export class ProductPriceHistoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() priceType: PriceType;
  @ApiProperty({ nullable: true }) oldPrice: number | null;
  @ApiProperty() newPrice: number;
  @ApiProperty({ nullable: true }) changedBy: string | null;
  @ApiProperty() changedAt: Date;

  constructor(e: ProductPriceHistoryEntry) {
    this.id = e.id;
    this.productId = e.productId;
    this.priceType = e.priceType;
    this.oldPrice = e.oldPrice;
    this.newPrice = e.newPrice;
    this.changedBy = e.changedBy;
    this.changedAt = e.changedAt;
  }
}
