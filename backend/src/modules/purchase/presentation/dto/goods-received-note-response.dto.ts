import { ApiProperty } from '@nestjs/swagger';
import {
  GoodsReceivedNote,
  GoodsReceivedNoteLine,
  GoodsReceivedNoteStatus,
} from '../../domain/goods-received-note.entity';

export class GoodsReceivedNoteLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) poLineId: string | null;
  @ApiProperty() productId: string;
  @ApiProperty() productUnitId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty() rate: number;
  @ApiProperty({ nullable: true }) remarks: string | null;

  constructor(l: GoodsReceivedNoteLine) {
    this.id = l.id;
    this.poLineId = l.poLineId;
    this.productId = l.productId;
    this.productUnitId = l.productUnitId;
    this.batchId = l.batchId;
    this.quantity = l.quantity;
    this.rate = l.rate;
    this.remarks = l.remarks;
  }
}

export class GoodsReceivedNoteResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() grnNumber: string;
  @ApiProperty() grnDate: Date;
  @ApiProperty({ nullable: true }) poId: string | null;
  @ApiProperty() supplierId: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) transporterId: string | null;
  @ApiProperty() status: GoodsReceivedNoteStatus;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [GoodsReceivedNoteLineResponseDto] }) lines: GoodsReceivedNoteLineResponseDto[];

  constructor(grn: GoodsReceivedNote) {
    this.id = grn.id;
    this.grnNumber = grn.grnNumber;
    this.grnDate = grn.grnDate;
    this.poId = grn.poId;
    this.supplierId = grn.supplierId;
    this.warehouseId = grn.warehouseId;
    this.transporterId = grn.transporterId;
    this.status = grn.status;
    this.remarks = grn.remarks;
    this.createdBy = grn.createdBy;
    this.createdAt = grn.createdAt;
    this.updatedAt = grn.updatedAt;
    this.lines = grn.lines.map((l) => new GoodsReceivedNoteLineResponseDto(l));
  }
}
