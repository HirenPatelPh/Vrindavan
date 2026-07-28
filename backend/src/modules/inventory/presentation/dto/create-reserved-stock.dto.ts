import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateReservedStockDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty({ example: 'sales_order' }) @IsString() @Length(1, 50) referenceType!: string;
  @ApiProperty() @IsUUID() referenceId!: string;
  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' }) @IsDateString() expiresAt!: string;
}
