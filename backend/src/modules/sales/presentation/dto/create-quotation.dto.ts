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

export class CreateQuotationLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() productUnitId!: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty() @Type(() => Number) @Min(0) rate!: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @Min(0) @Max(100) discountPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() gstId?: string;
}

export class CreateQuotationDto {
  @ApiProperty() @IsUUID() customerId!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() quotationDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validUntil?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [CreateQuotationLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationLineDto)
  lines!: CreateQuotationLineDto[];
}
