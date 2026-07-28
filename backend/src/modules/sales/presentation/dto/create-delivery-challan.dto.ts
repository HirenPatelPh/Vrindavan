import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateDeliveryChallanLineDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() soLineId?: string;
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() productUnitId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class CreateDeliveryChallanDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() soId?: string;
  @ApiProperty() @IsUUID() customerId!: string;
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() transporterId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dcDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [CreateDeliveryChallanLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryChallanLineDto)
  lines!: CreateDeliveryChallanLineDto[];
}
