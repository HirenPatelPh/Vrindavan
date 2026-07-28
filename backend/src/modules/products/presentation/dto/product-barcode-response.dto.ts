import { ApiProperty } from '@nestjs/swagger';
import { BarcodeType, ProductBarcode } from '../../domain/product-barcode.entity';

export class ProductBarcodeResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) productUnitId: string | null;
  @ApiProperty() barcode: string;
  @ApiProperty() barcodeType: BarcodeType;
  @ApiProperty() isPrimary: boolean;
  @ApiProperty() createdAt: Date;

  constructor(b: ProductBarcode) {
    this.id = b.id;
    this.productId = b.productId;
    this.productUnitId = b.productUnitId;
    this.barcode = b.barcode;
    this.barcodeType = b.barcodeType;
    this.isPrimary = b.isPrimary;
    this.createdAt = b.createdAt;
  }
}
