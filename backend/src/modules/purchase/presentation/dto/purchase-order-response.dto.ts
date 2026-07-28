import { ApiProperty } from '@nestjs/swagger';
import { PurchaseOrder, PurchaseOrderLine, PurchaseOrderStatus } from '../../domain/purchase-order.entity';

export class PurchaseOrderLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productUnitId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() receivedQuantity: number;
  @ApiProperty() rate: number;
  @ApiProperty() discountPercent: number;
  @ApiProperty({ nullable: true }) gstId: string | null;
  @ApiProperty() lineTotal: number;

  constructor(l: PurchaseOrderLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.productUnitId = l.productUnitId;
    this.quantity = l.quantity;
    this.receivedQuantity = l.receivedQuantity;
    this.rate = l.rate;
    this.discountPercent = l.discountPercent;
    this.gstId = l.gstId;
    this.lineTotal = l.lineTotal;
  }
}

export class PurchaseOrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() poNumber: string;
  @ApiProperty() poDate: Date;
  @ApiProperty() supplierId: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty() financialYearId: string;
  @ApiProperty({ nullable: true }) expectedDeliveryDate: Date | null;
  @ApiProperty() status: PurchaseOrderStatus;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty() totalAmount: number;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [PurchaseOrderLineResponseDto] }) lines: PurchaseOrderLineResponseDto[];

  constructor(po: PurchaseOrder) {
    this.id = po.id;
    this.poNumber = po.poNumber;
    this.poDate = po.poDate;
    this.supplierId = po.supplierId;
    this.warehouseId = po.warehouseId;
    this.financialYearId = po.financialYearId;
    this.expectedDeliveryDate = po.expectedDeliveryDate;
    this.status = po.status;
    this.remarks = po.remarks;
    this.totalAmount = po.totalAmount;
    this.createdBy = po.createdBy;
    this.approvedBy = po.approvedBy;
    this.approvedAt = po.approvedAt;
    this.createdAt = po.createdAt;
    this.updatedAt = po.updatedAt;
    this.lines = po.lines.map((l) => new PurchaseOrderLineResponseDto(l));
  }
}
