import { ApiProperty } from '@nestjs/swagger';
import { PurchaseReturn, PurchaseReturnLine, PurchaseReturnStatus } from '../../domain/purchase-return.entity';

export class PurchaseReturnLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty() rate: number;
  @ApiProperty() lineTotal: number;

  constructor(l: PurchaseReturnLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.batchId = l.batchId;
    this.quantity = l.quantity;
    this.rate = l.rate;
    this.lineTotal = l.lineTotal;
  }
}

export class PurchaseReturnResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() returnNumber: string;
  @ApiProperty() returnDate: Date;
  @ApiProperty() supplierId: string;
  @ApiProperty({ nullable: true }) purchaseInvoiceId: string | null;
  @ApiProperty() warehouseId: string;
  @ApiProperty({ nullable: true }) reason: string | null;
  @ApiProperty() status: PurchaseReturnStatus;
  @ApiProperty() totalAmount: number;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [PurchaseReturnLineResponseDto] }) lines: PurchaseReturnLineResponseDto[];

  constructor(r: PurchaseReturn) {
    this.id = r.id;
    this.returnNumber = r.returnNumber;
    this.returnDate = r.returnDate;
    this.supplierId = r.supplierId;
    this.purchaseInvoiceId = r.purchaseInvoiceId;
    this.warehouseId = r.warehouseId;
    this.reason = r.reason;
    this.status = r.status;
    this.totalAmount = r.totalAmount;
    this.createdBy = r.createdBy;
    this.approvedBy = r.approvedBy;
    this.approvedAt = r.approvedAt;
    this.createdAt = r.createdAt;
    this.updatedAt = r.updatedAt;
    this.lines = r.lines.map((l) => new PurchaseReturnLineResponseDto(l));
  }
}
