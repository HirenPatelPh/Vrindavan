import { ApiProperty } from '@nestjs/swagger';
import { StockReturn, StockReturnLine, StockReturnStatus } from '../../domain/stock-return.entity';

class StockReturnLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty({ nullable: true }) rackId: string | null;
  @ApiProperty({ nullable: true }) locationId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty({ nullable: true }) remarks: string | null;

  constructor(l: StockReturnLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.batchId = l.batchId;
    this.rackId = l.rackId;
    this.locationId = l.locationId;
    this.quantity = l.quantity;
    this.remarks = l.remarks;
  }
}

export class StockReturnResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() returnNumber: string;
  @ApiProperty() returnDate: Date;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) reason: string | null;
  @ApiProperty() status: StockReturnStatus;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [StockReturnLineResponseDto] }) lines: StockReturnLineResponseDto[];

  constructor(r: StockReturn) {
    this.id = r.id;
    this.returnNumber = r.returnNumber;
    this.returnDate = r.returnDate;
    this.warehouseId = r.warehouseId;
    this.reason = r.reason;
    this.status = r.status;
    this.approvedBy = r.approvedBy;
    this.approvedAt = r.approvedAt;
    this.createdAt = r.createdAt;
    this.updatedAt = r.updatedAt;
    this.lines = r.lines.map((l) => new StockReturnLineResponseDto(l));
  }
}
