import { ApiProperty } from '@nestjs/swagger';
import { ProductUnit } from '../../domain/product-unit.entity';

export class ProductUnitResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() unitId: string;
  @ApiProperty() isBaseUnit: boolean;
  @ApiProperty() conversionFactor: number;
  @ApiProperty({ nullable: true }) purchasePrice: number | null;
  @ApiProperty({ nullable: true }) sellingPrice: number | null;
  @ApiProperty({ nullable: true }) barcode: string | null;
  @ApiProperty() createdAt: Date;

  constructor(u: ProductUnit) {
    this.id = u.id;
    this.productId = u.productId;
    this.unitId = u.unitId;
    this.isBaseUnit = u.isBaseUnit;
    this.conversionFactor = u.conversionFactor;
    this.purchasePrice = u.purchasePrice;
    this.sellingPrice = u.sellingPrice;
    this.barcode = u.barcode;
    this.createdAt = u.createdAt;
  }
}
