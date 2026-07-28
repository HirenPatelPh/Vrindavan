import { ApiProperty } from '@nestjs/swagger';
import { SalesInvoice, SalesInvoiceLine, SalesInvoiceStatus } from '../../domain/sales-invoice.entity';

export class SalesInvoiceLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productUnitId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty() rate: number;
  @ApiProperty() discountPercent: number;
  @ApiProperty({ nullable: true }) gstId: string | null;
  @ApiProperty() taxAmount: number;
  @ApiProperty() lineTotal: number;

  constructor(l: SalesInvoiceLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.productUnitId = l.productUnitId;
    this.batchId = l.batchId;
    this.quantity = l.quantity;
    this.rate = l.rate;
    this.discountPercent = l.discountPercent;
    this.gstId = l.gstId;
    this.taxAmount = l.taxAmount;
    this.lineTotal = l.lineTotal;
  }
}

export class SalesInvoiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty() invoiceDate: Date;
  @ApiProperty({ nullable: true }) dcId: string | null;
  @ApiProperty({ nullable: true }) soId: string | null;
  @ApiProperty() customerId: string;
  @ApiProperty() financialYearId: string;
  @ApiProperty({ nullable: true }) dueDate: Date | null;
  @ApiProperty() status: SalesInvoiceStatus;
  @ApiProperty() subtotal: number;
  @ApiProperty() taxAmount: number;
  @ApiProperty() discountAmount: number;
  @ApiProperty() totalAmount: number;
  @ApiProperty() paidAmount: number;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty({ nullable: true }) approvedBy: string | null;
  @ApiProperty({ nullable: true }) approvedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [SalesInvoiceLineResponseDto] }) lines: SalesInvoiceLineResponseDto[];

  constructor(inv: SalesInvoice) {
    this.id = inv.id;
    this.invoiceNumber = inv.invoiceNumber;
    this.invoiceDate = inv.invoiceDate;
    this.dcId = inv.dcId;
    this.soId = inv.soId;
    this.customerId = inv.customerId;
    this.financialYearId = inv.financialYearId;
    this.dueDate = inv.dueDate;
    this.status = inv.status;
    this.subtotal = inv.subtotal;
    this.taxAmount = inv.taxAmount;
    this.discountAmount = inv.discountAmount;
    this.totalAmount = inv.totalAmount;
    this.paidAmount = inv.paidAmount;
    this.createdBy = inv.createdBy;
    this.approvedBy = inv.approvedBy;
    this.approvedAt = inv.approvedAt;
    this.createdAt = inv.createdAt;
    this.updatedAt = inv.updatedAt;
    this.lines = inv.lines.map((l) => new SalesInvoiceLineResponseDto(l));
  }
}
