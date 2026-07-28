import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateStockTransferLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() fromRackId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() fromLocationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() toRackId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() toLocationId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
}

export class CreateStockTransferDto {
  @ApiProperty() @IsUUID() fromWarehouseId!: string;
  @ApiProperty() @IsUUID() toWarehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() transferDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [CreateStockTransferLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateStockTransferLineDto)
  lines!: CreateStockTransferLineDto[];
}
