import { ApiProperty } from '@nestjs/swagger';
import { OutstandingPayableRow } from '../../domain/outstanding-payable.entity';

export class OutstandingPayableResponseDto {
  @ApiProperty() purchaseInvoiceId: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty() invoiceDate: Date;
  @ApiProperty({ nullable: true }) dueDate: Date | null;
  @ApiProperty() supplierId: string;
  @ApiProperty() supplierName: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() paidAmount: number;
  @ApiProperty() outstandingAmount: number;
  @ApiProperty() daysOverdue: number;

  constructor(r: OutstandingPayableRow) {
    this.purchaseInvoiceId = r.purchaseInvoiceId;
    this.invoiceNumber = r.invoiceNumber;
    this.invoiceDate = r.invoiceDate;
    this.dueDate = r.dueDate;
    this.supplierId = r.supplierId;
    this.supplierName = r.supplierName;
    this.totalAmount = r.totalAmount;
    this.paidAmount = r.paidAmount;
    this.outstandingAmount = r.outstandingAmount;
    this.daysOverdue = r.daysOverdue;
  }
}
