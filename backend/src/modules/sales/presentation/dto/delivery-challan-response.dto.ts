import { ApiProperty } from '@nestjs/swagger';
import { DeliveryChallan, DeliveryChallanLine, DeliveryChallanStatus } from '../../domain/delivery-challan.entity';

export class DeliveryChallanLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) soLineId: string | null;
  @ApiProperty() productId: string;
  @ApiProperty() productUnitId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty({ nullable: true }) remarks: string | null;

  constructor(l: DeliveryChallanLine) {
    this.id = l.id;
    this.soLineId = l.soLineId;
    this.productId = l.productId;
    this.productUnitId = l.productUnitId;
    this.batchId = l.batchId;
    this.quantity = l.quantity;
    this.remarks = l.remarks;
  }
}

export class DeliveryChallanResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() dcNumber: string;
  @ApiProperty() dcDate: Date;
  @ApiProperty({ nullable: true }) soId: string | null;
  @ApiProperty() customerId: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) transporterId: string | null;
  @ApiProperty() status: DeliveryChallanStatus;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [DeliveryChallanLineResponseDto] }) lines: DeliveryChallanLineResponseDto[];

  constructor(dc: DeliveryChallan) {
    this.id = dc.id;
    this.dcNumber = dc.dcNumber;
    this.dcDate = dc.dcDate;
    this.soId = dc.soId;
    this.customerId = dc.customerId;
    this.warehouseId = dc.warehouseId;
    this.transporterId = dc.transporterId;
    this.status = dc.status;
    this.remarks = dc.remarks;
    this.createdBy = dc.createdBy;
    this.createdAt = dc.createdAt;
    this.updatedAt = dc.updatedAt;
    this.lines = dc.lines.map((l) => new DeliveryChallanLineResponseDto(l));
  }
}
