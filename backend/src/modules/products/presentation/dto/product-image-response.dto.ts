import { ApiProperty } from '@nestjs/swagger';
import { ProductImage } from '../../domain/product-image.entity';

export class ProductImageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() imageUrl: string;
  @ApiProperty() isPrimary: boolean;
  @ApiProperty() sortOrder: number;
  @ApiProperty() createdAt: Date;

  constructor(i: ProductImage) {
    this.id = i.id;
    this.productId = i.productId;
    this.imageUrl = i.imageUrl;
    this.isPrimary = i.isPrimary;
    this.sortOrder = i.sortOrder;
    this.createdAt = i.createdAt;
  }
}
