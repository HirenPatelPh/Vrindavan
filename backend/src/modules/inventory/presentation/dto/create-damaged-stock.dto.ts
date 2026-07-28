import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateDamagedStockLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() rackId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class CreateDamagedStockDto {
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() damageDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiProperty({ type: [CreateDamagedStockLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDamagedStockLineDto)
  lines!: CreateDamagedStockLineDto[];
}
