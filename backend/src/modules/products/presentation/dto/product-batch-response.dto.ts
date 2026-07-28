import { ApiProperty } from '@nestjs/swagger';
import { ProductBatch } from '../../domain/product-batch.entity';

export class ProductBatchResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() batchNumber: string;
  @ApiProperty({ nullable: true }) lotNumber: string | null;
  @ApiProperty({ nullable: true }) manufacturingDate: Date | null;
  @ApiProperty({ nullable: true }) expiryDate: Date | null;
  @ApiProperty() createdAt: Date;

  constructor(b: ProductBatch) {
    this.id = b.id;
    this.productId = b.productId;
    this.batchNumber = b.batchNumber;
    this.lotNumber = b.lotNumber;
    this.manufacturingDate = b.manufacturingDate;
    this.expiryDate = b.expiryDate;
    this.createdAt = b.createdAt;
  }
}
