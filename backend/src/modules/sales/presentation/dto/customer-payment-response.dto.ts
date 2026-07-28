import { ApiProperty } from '@nestjs/swagger';
import { CustomerPayment, CustomerPaymentAllocation, PaymentMode } from '../../domain/customer-payment.entity';

export class CustomerPaymentAllocationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() salesInvoiceId: string;
  @ApiProperty() allocatedAmount: number;

  constructor(a: CustomerPaymentAllocation) {
    this.id = a.id;
    this.salesInvoiceId = a.salesInvoiceId;
    this.allocatedAmount = a.allocatedAmount;
  }
}

export class CustomerPaymentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() paymentNumber: string;
  @ApiProperty() paymentDate: Date;
  @ApiProperty() customerId: string;
  @ApiProperty() amount: number;
  @ApiProperty() paymentMode: PaymentMode;
  @ApiProperty({ nullable: true }) referenceNumber: string | null;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: [CustomerPaymentAllocationResponseDto] }) allocations: CustomerPaymentAllocationResponseDto[];

  constructor(p: CustomerPayment) {
    this.id = p.id;
    this.paymentNumber = p.paymentNumber;
    this.paymentDate = p.paymentDate;
    this.customerId = p.customerId;
    this.amount = p.amount;
    this.paymentMode = p.paymentMode;
    this.referenceNumber = p.referenceNumber;
    this.remarks = p.remarks;
    this.createdBy = p.createdBy;
    this.createdAt = p.createdAt;
    this.allocations = p.allocations.map((a) => new CustomerPaymentAllocationResponseDto(a));
  }
}
