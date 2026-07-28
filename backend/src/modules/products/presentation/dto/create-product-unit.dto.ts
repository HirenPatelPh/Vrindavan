import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateProductUnitDto {
  @ApiProperty() @IsUUID() unitId!: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isBaseUnit?: boolean;
  @ApiProperty({ description: '1 of this unit = factor * base unit', example: 12 })
  @IsNumber()
  @Min(0.000001)
  conversionFactor!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) purchasePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) sellingPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 50) barcode?: string;
}
