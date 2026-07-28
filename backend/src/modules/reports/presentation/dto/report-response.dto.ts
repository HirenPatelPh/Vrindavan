import { ApiProperty } from '@nestjs/swagger';
import {
  CustomerBreakdownRow,
  GstSummaryRow,
  ProductBreakdownRow,
  PurchaseRegisterRow,
  SalesRegisterRow,
  SupplierBreakdownRow,
} from '../../domain/report.repository.interface';

export class SalesRegisterResponseDto {
  @ApiProperty() invoiceId: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty() invoiceDate: Date;
  @ApiProperty() customerId: string;
  @ApiProperty() customerName: string;
  @ApiProperty() subtotal: number;
  @ApiProperty() taxAmount: number;
  @ApiProperty() discountAmount: number;
  @ApiProperty() totalAmount: number;
  @ApiProperty() paidAmount: number;
  @ApiProperty() status: string;

  constructor(r: SalesRegisterRow) {
    this.invoiceId = r.invoiceId;
    this.invoiceNumber = r.invoiceNumber;
    this.invoiceDate = r.invoiceDate;
    this.customerId = r.customerId;
    this.customerName = r.customerName;
    this.subtotal = r.subtotal;
    this.taxAmount = r.taxAmount;
    this.discountAmount = r.discountAmount;
    this.totalAmount = r.totalAmount;
    this.paidAmount = r.paidAmount;
    this.status = r.status;
  }
}

export class PurchaseRegisterResponseDto {
  @ApiProperty() invoiceId: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty() invoiceDate: Date;
  @ApiProperty() supplierId: string;
  @ApiProperty() supplierName: string;
  @ApiProperty() subtotal: number;
  @ApiProperty() taxAmount: number;
  @ApiProperty() discountAmount: number;
  @ApiProperty() totalAmount: number;
  @ApiProperty() paidAmount: number;
  @ApiProperty() status: string;

  constructor(r: PurchaseRegisterRow) {
    this.invoiceId = r.invoiceId;
    this.invoiceNumber = r.invoiceNumber;
    this.invoiceDate = r.invoiceDate;
    this.supplierId = r.supplierId;
    this.supplierName = r.supplierName;
    this.subtotal = r.subtotal;
    this.taxAmount = r.taxAmount;
    this.discountAmount = r.discountAmount;
    this.totalAmount = r.totalAmount;
    this.paidAmount = r.paidAmount;
    this.status = r.status;
  }
}

export class ProductBreakdownResponseDto {
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() sku: string;
  @ApiProperty() totalQuantity: number;
  @ApiProperty() totalAmount: number;
  @ApiProperty() invoiceCount: number;

  constructor(r: ProductBreakdownRow) {
    this.productId = r.productId;
    this.productName = r.productName;
    this.sku = r.sku;
    this.totalQuantity = r.totalQuantity;
    this.totalAmount = r.totalAmount;
    this.invoiceCount = r.invoiceCount;
  }
}

export class CustomerBreakdownResponseDto {
  @ApiProperty() customerId: string;
  @ApiProperty() customerName: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() invoiceCount: number;

  constructor(r: CustomerBreakdownRow) {
    this.customerId = r.customerId;
    this.customerName = r.customerName;
    this.totalAmount = r.totalAmount;
    this.invoiceCount = r.invoiceCount;
  }
}

export class SupplierBreakdownResponseDto {
  @ApiProperty() supplierId: string;
  @ApiProperty() supplierName: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() invoiceCount: number;

  constructor(r: SupplierBreakdownRow) {
    this.supplierId = r.supplierId;
    this.supplierName = r.supplierName;
    this.totalAmount = r.totalAmount;
    this.invoiceCount = r.invoiceCount;
  }
}

export class GstSummaryResponseDto {
  @ApiProperty({ nullable: true }) gstRateId: string | null;
  @ApiProperty() gstRateName: string;
  @ApiProperty() totalRate: number;
  @ApiProperty() taxableValue: number;
  @ApiProperty() taxAmount: number;
  @ApiProperty() invoiceCount: number;

  constructor(r: GstSummaryRow) {
    this.gstRateId = r.gstRateId;
    this.gstRateName = r.gstRateName;
    this.totalRate = r.totalRate;
    this.taxableValue = r.taxableValue;
    this.taxAmount = r.taxAmount;
    this.invoiceCount = r.invoiceCount;
  }
}
