import { ApiProperty } from '@nestjs/swagger';
import { PurchaseInvoice, PurchaseInvoiceLine, PurchaseInvoiceStatus } from '../../domain/purchase-invoice.entity';

export class PurchaseInvoiceLineResponseDto {
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

  constructor(l: PurchaseInvoiceLine) {
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

export class PurchaseInvoiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty() invoiceDate: Date;
  @ApiProperty({ nullable: true }) supplierInvoiceNumber: string | null;
  @ApiProperty({ nullable: true }) grnId: string | null;
  @ApiProperty({ nullable: true }) poId: string | null;
  @ApiProperty() supplierId: string;
  @ApiProperty() financialYearId: string;
  @ApiProperty({ nullable: true }) dueDate: Date | null;
  @ApiProperty() status: PurchaseInvoiceStatus;
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
  @ApiProperty({ type: [PurchaseInvoiceLineResponseDto] }) lines: PurchaseInvoiceLineResponseDto[];

  constructor(inv: PurchaseInvoice) {
    this.id = inv.id;
    this.invoiceNumber = inv.invoiceNumber;
    this.invoiceDate = inv.invoiceDate;
    this.supplierInvoiceNumber = inv.supplierInvoiceNumber;
    this.grnId = inv.grnId;
    this.poId = inv.poId;
    this.supplierId = inv.supplierId;
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
    this.lines = inv.lines.map((l) => new PurchaseInvoiceLineResponseDto(l));
  }
}
