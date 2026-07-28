import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSalesInvoiceLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() productUnitId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty() @Type(() => Number) @Min(0) rate!: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @Min(0) @Max(100) discountPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() gstId?: string;
}

export class CreateSalesInvoiceDto {
  @ApiProperty() @IsUUID() customerId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() dcId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() soId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() invoiceDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional({ default: 0, description: 'Flat header-level adjustment, applied after line totals' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  discountAmount?: number;
  @ApiProperty({ type: [CreateSalesInvoiceLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesInvoiceLineDto)
  lines!: CreateSalesInvoiceLineDto[];
}
