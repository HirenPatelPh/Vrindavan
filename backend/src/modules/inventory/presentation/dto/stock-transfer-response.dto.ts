import { ApiProperty } from '@nestjs/swagger';
import { StockTransfer, StockTransferLine, StockTransferStatus } from '../../domain/stock-transfer.entity';

class StockTransferLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty({ nullable: true }) fromRackId: string | null;
  @ApiProperty({ nullable: true }) fromLocationId: string | null;
  @ApiProperty({ nullable: true }) toRackId: string | null;
  @ApiProperty({ nullable: true }) toLocationId: string | null;
  @ApiProperty() quantity: number;

  constructor(l: StockTransferLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.batchId = l.batchId;
    this.fromRackId = l.fromRackId;
    this.fromLocationId = l.fromLocationId;
    this.toRackId = l.toRackId;
    this.toLocationId = l.toLocationId;
    this.quantity = l.quantity;
  }
}

export class StockTransferResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() transferNumber: string;
  @ApiProperty() transferDate: Date;
  @ApiProperty() fromWarehouseId: string;
  @ApiProperty() toWarehouseId: string;
  @ApiProperty() status: StockTransferStatus;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [StockTransferLineResponseDto] }) lines: StockTransferLineResponseDto[];

  constructor(t: StockTransfer) {
    this.id = t.id;
    this.transferNumber = t.transferNumber;
    this.transferDate = t.transferDate;
    this.fromWarehouseId = t.fromWarehouseId;
    this.toWarehouseId = t.toWarehouseId;
    this.status = t.status;
    this.remarks = t.remarks;
    this.approvedBy = t.approvedBy;
    this.approvedAt = t.approvedAt;
    this.createdAt = t.createdAt;
    this.updatedAt = t.updatedAt;
    this.lines = t.lines.map((l) => new StockTransferLineResponseDto(l));
  }
}
