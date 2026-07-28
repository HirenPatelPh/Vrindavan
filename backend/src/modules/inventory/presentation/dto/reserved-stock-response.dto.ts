import { ApiProperty } from '@nestjs/swagger';
import { ReservedStockEntry, ReservedStockStatus } from '../../domain/reserved-stock.entity';

export class ReservedStockResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty() referenceType: string;
  @ApiProperty() referenceId: string;
  @ApiProperty({ nullable: true }) reservedBy: string | null;
  @ApiProperty() reservedAt: Date;
  @ApiProperty() expiresAt: Date;
  @ApiProperty() status: ReservedStockStatus;
  @ApiProperty({ nullable: true }) releasedAt: Date | null;

  constructor(e: ReservedStockEntry) {
    this.id = e.id;
    this.productId = e.productId;
    this.warehouseId = e.warehouseId;
    this.batchId = e.batchId;
    this.quantity = e.quantity;
    this.referenceType = e.referenceType;
    this.referenceId = e.referenceId;
    this.reservedBy = e.reservedBy;
    this.reservedAt = e.reservedAt;
    this.expiresAt = e.expiresAt;
    this.status = e.status;
    this.releasedAt = e.releasedAt;
  }
}
