import { ApiProperty } from '@nestjs/swagger';
import { StockLedgerEntry } from '../../domain/stock-ledger.entity';
import { MovementType } from '../../infrastructure/stock-posting.helper';

export class StockLedgerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) rackId: string | null;
  @ApiProperty({ nullable: true }) locationId: string | null;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty() movementType: MovementType;
  @ApiProperty() qtyIn: number;
  @ApiProperty() qtyOut: number;
  @ApiProperty() unitCost: number;
  @ApiProperty() referenceType: string;
  @ApiProperty() referenceId: string;
  @ApiProperty({ nullable: true }) referenceLineId: string | null;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty() createdAt: Date;

  constructor(e: StockLedgerEntry) {
    this.id = e.id;
    this.productId = e.productId;
    this.warehouseId = e.warehouseId;
    this.rackId = e.rackId;
    this.locationId = e.locationId;
    this.batchId = e.batchId;
    this.movementType = e.movementType;
    this.qtyIn = e.qtyIn;
    this.qtyOut = e.qtyOut;
    this.unitCost = e.unitCost;
    this.referenceType = e.referenceType;
    this.referenceId = e.referenceId;
    this.referenceLineId = e.referenceLineId;
    this.remarks = e.remarks;
    this.createdBy = e.createdBy;
    this.createdAt = e.createdAt;
  }
}
