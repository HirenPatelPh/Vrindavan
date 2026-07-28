import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseInvoiceLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() productUnitId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty() @Type(() => Number) @Min(0) rate!: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @Min(0) @Max(100) discountPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() gstId?: string;
}

export class CreatePurchaseInvoiceDto {
  @ApiProperty() @IsUUID() supplierId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() grnId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() poId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() supplierInvoiceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() invoiceDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional({ default: 0, description: 'Flat header-level adjustment, applied after line totals' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  discountAmount?: number;
  @ApiProperty({ type: [CreatePurchaseInvoiceLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceLineDto)
  lines!: CreatePurchaseInvoiceLineDto[];
}
