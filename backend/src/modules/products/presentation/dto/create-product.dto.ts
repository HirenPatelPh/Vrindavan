import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty() @IsString() @Length(1, 200) name!: string;
  @ApiProperty() @IsString() @Length(1, 50) sku!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 50) barcode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) qrCode?: string;
  @ApiProperty() @IsUUID() categoryId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() subCategoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() brandId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() hsnId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() gstId?: string;
  @ApiProperty({ description: 'Stock-keeping base unit (e.g. Piece)' }) @IsUUID() baseUnitId!: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) purchasePrice?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) sellingPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) mrp?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) minimumStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maximumStock?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) reorderLevel?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) openingStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) piecesPerBox?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) piecesPerBag?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) weight?: number;
  @ApiPropertyOptional({ example: 'kg' }) @IsOptional() @IsString() @Length(1, 10) weightUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) dimensionLength?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) dimensionWidth?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) dimensionHeight?: number;
  @ApiPropertyOptional({ example: 'cm' }) @IsOptional() @IsString() @Length(1, 10) dimensionUnit?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() hasBatchTracking?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() hasExpiryTracking?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
