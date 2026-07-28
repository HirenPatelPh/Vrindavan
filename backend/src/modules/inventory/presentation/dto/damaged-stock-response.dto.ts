import { ApiProperty } from '@nestjs/swagger';
import { DamagedStock, DamagedStockLine, DamagedStockStatus } from '../../domain/damaged-stock.entity';

class DamagedStockLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty({ nullable: true }) rackId: string | null;
  @ApiProperty({ nullable: true }) locationId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty({ nullable: true }) remarks: string | null;

  constructor(l: DamagedStockLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.batchId = l.batchId;
    this.rackId = l.rackId;
    this.locationId = l.locationId;
    this.quantity = l.quantity;
    this.remarks = l.remarks;
  }
}

export class DamagedStockResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() damageNumber: string;
  @ApiProperty() damageDate: Date;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) reason: string | null;
  @ApiProperty() status: DamagedStockStatus;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [DamagedStockLineResponseDto] }) lines: DamagedStockLineResponseDto[];

  constructor(d: DamagedStock) {
    this.id = d.id;
    this.damageNumber = d.damageNumber;
    this.damageDate = d.damageDate;
    this.warehouseId = d.warehouseId;
    this.reason = d.reason;
    this.status = d.status;
    this.approvedBy = d.approvedBy;
    this.approvedAt = d.approvedAt;
    this.createdAt = d.createdAt;
    this.updatedAt = d.updatedAt;
    this.lines = d.lines.map((l) => new DamagedStockLineResponseDto(l));
  }
}
