import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode, SupplierPayment, SupplierPaymentAllocation } from '../../domain/supplier-payment.entity';

export class SupplierPaymentAllocationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() purchaseInvoiceId: string;
  @ApiProperty() allocatedAmount: number;

  constructor(a: SupplierPaymentAllocation) {
    this.id = a.id;
    this.purchaseInvoiceId = a.purchaseInvoiceId;
    this.allocatedAmount = a.allocatedAmount;
  }
}

export class SupplierPaymentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() paymentNumber: string;
  @ApiProperty() paymentDate: Date;
  @ApiProperty() supplierId: string;
  @ApiProperty() amount: number;
  @ApiProperty() paymentMode: PaymentMode;
  @ApiProperty({ nullable: true }) referenceNumber: string | null;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: [SupplierPaymentAllocationResponseDto] }) allocations: SupplierPaymentAllocationResponseDto[];

  constructor(p: SupplierPayment) {
    this.id = p.id;
    this.paymentNumber = p.paymentNumber;
    this.paymentDate = p.paymentDate;
    this.supplierId = p.supplierId;
    this.amount = p.amount;
    this.paymentMode = p.paymentMode;
    this.referenceNumber = p.referenceNumber;
    this.remarks = p.remarks;
    this.createdBy = p.createdBy;
    this.createdAt = p.createdAt;
    this.allocations = p.allocations.map((a) => new SupplierPaymentAllocationResponseDto(a));
  }
}
