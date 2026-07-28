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

export class CreatePurchaseOrderLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() productUnitId!: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty() @Type(() => Number) @Min(0) rate!: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @Min(0) @Max(100) discountPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() gstId?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty() @IsUUID() supplierId!: string;
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() poDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedDeliveryDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [CreatePurchaseOrderLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderLineDto)
  lines!: CreatePurchaseOrderLineDto[];
}
