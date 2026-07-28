import { ApiProperty } from '@nestjs/swagger';
import { OutstandingReceivableRow } from '../../domain/outstanding-receivable.entity';

export class OutstandingReceivableResponseDto {
  @ApiProperty() salesInvoiceId: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty() invoiceDate: Date;
  @ApiProperty({ nullable: true }) dueDate: Date | null;
  @ApiProperty() customerId: string;
  @ApiProperty() customerName: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() paidAmount: number;
  @ApiProperty() outstandingAmount: number;
  @ApiProperty() daysOverdue: number;

  constructor(r: OutstandingReceivableRow) {
    this.salesInvoiceId = r.salesInvoiceId;
    this.invoiceNumber = r.invoiceNumber;
    this.invoiceDate = r.invoiceDate;
    this.dueDate = r.dueDate;
    this.customerId = r.customerId;
    this.customerName = r.customerName;
    this.totalAmount = r.totalAmount;
    this.paidAmount = r.paidAmount;
    this.outstandingAmount = r.outstandingAmount;
    this.daysOverdue = r.daysOverdue;
  }
}
