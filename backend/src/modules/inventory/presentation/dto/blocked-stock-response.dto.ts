import { ApiProperty } from '@nestjs/swagger';
import { BlockedStockEntry, BlockedStockStatus } from '../../domain/blocked-stock.entity';

export class BlockedStockResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) rackId: string | null;
  @ApiProperty({ nullable: true }) locationId: string | null;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty() reason: string;
  @ApiProperty() status: BlockedStockStatus;
  @ApiProperty({ nullable: true }) blockedBy: string | null;
  @ApiProperty() blockedAt: Date;
  @ApiProperty({ nullable: true }) releasedBy: string | null;
  @ApiProperty({ nullable: true }) releasedAt: Date | null;

  constructor(e: BlockedStockEntry) {
    this.id = e.id;
    this.productId = e.productId;
    this.warehouseId = e.warehouseId;
    this.rackId = e.rackId;
    this.locationId = e.locationId;
    this.batchId = e.batchId;
    this.quantity = e.quantity;
    this.reason = e.reason;
    this.status = e.status;
    this.blockedBy = e.blockedBy;
    this.blockedAt = e.blockedAt;
    this.releasedBy = e.releasedBy;
    this.releasedAt = e.releasedAt;
  }
}
