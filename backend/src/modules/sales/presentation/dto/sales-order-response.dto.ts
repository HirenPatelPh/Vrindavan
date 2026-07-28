import { ApiProperty } from '@nestjs/swagger';
import { SalesOrder, SalesOrderLine, SalesOrderStatus } from '../../domain/sales-order.entity';

export class SalesOrderLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productUnitId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() deliveredQuantity: number;
  @ApiProperty() rate: number;
  @ApiProperty() discountPercent: number;
  @ApiProperty({ nullable: true }) gstId: string | null;
  @ApiProperty() lineTotal: number;

  constructor(l: SalesOrderLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.productUnitId = l.productUnitId;
    this.quantity = l.quantity;
    this.deliveredQuantity = l.deliveredQuantity;
    this.rate = l.rate;
    this.discountPercent = l.discountPercent;
    this.gstId = l.gstId;
    this.lineTotal = l.lineTotal;
  }
}

export class SalesOrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() soNumber: string;
  @ApiProperty() soDate: Date;
  @ApiProperty() customerId: string;
  @ApiProperty({ nullable: true }) quotationId: string | null;
  @ApiProperty() warehouseId: string;
  @ApiProperty() financialYearId: string;
  @ApiProperty({ nullable: true }) expectedDeliveryDate: Date | null;
  @ApiProperty() status: SalesOrderStatus;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty() totalAmount: number;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [SalesOrderLineResponseDto] }) lines: SalesOrderLineResponseDto[];

  constructor(so: SalesOrder) {
    this.id = so.id;
    this.soNumber = so.soNumber;
    this.soDate = so.soDate;
    this.customerId = so.customerId;
    this.quotationId = so.quotationId;
    this.warehouseId = so.warehouseId;
    this.financialYearId = so.financialYearId;
    this.expectedDeliveryDate = so.expectedDeliveryDate;
    this.status = so.status;
    this.remarks = so.remarks;
    this.totalAmount = so.totalAmount;
    this.createdBy = so.createdBy;
    this.approvedBy = so.approvedBy;
    this.approvedAt = so.approvedAt;
    this.createdAt = so.createdAt;
    this.updatedAt = so.updatedAt;
    this.lines = so.lines.map((l) => new SalesOrderLineResponseDto(l));
  }
}
