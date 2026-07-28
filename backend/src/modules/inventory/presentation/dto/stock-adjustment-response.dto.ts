import { ApiProperty } from '@nestjs/swagger';
import { StockAdjustment, StockAdjustmentLine, StockAdjustmentStatus } from '../../domain/stock-adjustment.entity';

class StockAdjustmentLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty({ nullable: true }) rackId: string | null;
  @ApiProperty({ nullable: true }) locationId: string | null;
  @ApiProperty() systemQuantity: number;
  @ApiProperty() adjustedQuantity: number;
  @ApiProperty({ nullable: true }) remarks: string | null;

  constructor(l: StockAdjustmentLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.batchId = l.batchId;
    this.rackId = l.rackId;
    this.locationId = l.locationId;
    this.systemQuantity = l.systemQuantity;
    this.adjustedQuantity = l.adjustedQuantity;
    this.remarks = l.remarks;
  }
}

export class StockAdjustmentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() adjustmentNumber: string;
  @ApiProperty() adjustmentDate: Date;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) reason: string | null;
  @ApiProperty() status: StockAdjustmentStatus;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [StockAdjustmentLineResponseDto] }) lines: StockAdjustmentLineResponseDto[];

  constructor(a: StockAdjustment) {
    this.id = a.id;
    this.adjustmentNumber = a.adjustmentNumber;
    this.adjustmentDate = a.adjustmentDate;
    this.warehouseId = a.warehouseId;
    this.reason = a.reason;
    this.status = a.status;
    this.approvedBy = a.approvedBy;
    this.approvedAt = a.approvedAt;
    this.createdAt = a.createdAt;
    this.updatedAt = a.updatedAt;
    this.lines = a.lines.map((l) => new StockAdjustmentLineResponseDto(l));
  }
}
