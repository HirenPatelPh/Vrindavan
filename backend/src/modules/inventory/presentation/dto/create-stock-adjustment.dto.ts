import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateStockAdjustmentLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() rackId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiProperty({ description: 'The counted/target quantity this line should result in' })
  @Type(() => Number)
  @Min(0)
  adjustedQuantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class CreateStockAdjustmentDto {
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() adjustmentDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiProperty({ type: [CreateStockAdjustmentLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateStockAdjustmentLineDto)
  lines!: CreateStockAdjustmentLineDto[];
}
