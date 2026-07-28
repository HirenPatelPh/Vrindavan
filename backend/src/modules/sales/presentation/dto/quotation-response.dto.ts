import { ApiProperty } from '@nestjs/swagger';
import { Quotation, QuotationLine, QuotationStatus } from '../../domain/quotation.entity';

export class QuotationLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productUnitId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() rate: number;
  @ApiProperty() discountPercent: number;
  @ApiProperty({ nullable: true }) gstId: string | null;
  @ApiProperty() lineTotal: number;

  constructor(l: QuotationLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.productUnitId = l.productUnitId;
    this.quantity = l.quantity;
    this.rate = l.rate;
    this.discountPercent = l.discountPercent;
    this.gstId = l.gstId;
    this.lineTotal = l.lineTotal;
  }
}

export class QuotationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() quotationNumber: string;
  @ApiProperty() quotationDate: Date;
  @ApiProperty() customerId: string;
  @ApiProperty({ nullable: true }) validUntil: Date | null;
  @ApiProperty() status: QuotationStatus;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty() totalAmount: number;
  @ApiProperty({ nullable: true }) createdBy: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [QuotationLineResponseDto] }) lines: QuotationLineResponseDto[];

  constructor(q: Quotation) {
    this.id = q.id;
    this.quotationNumber = q.quotationNumber;
    this.quotationDate = q.quotationDate;
    this.customerId = q.customerId;
    this.validUntil = q.validUntil;
    this.status = q.status;
    this.remarks = q.remarks;
    this.totalAmount = q.totalAmount;
    this.createdBy = q.createdBy;
    this.createdAt = q.createdAt;
    this.updatedAt = q.updatedAt;
    this.lines = q.lines.map((l) => new QuotationLineResponseDto(l));
  }
}
