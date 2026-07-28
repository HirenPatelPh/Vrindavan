import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateGoodsReceivedNoteLineDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() poLineId?: string;
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() productUnitId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty() @Type(() => Number) @Min(0) rate!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class CreateGoodsReceivedNoteDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() poId?: string;
  @ApiProperty() @IsUUID() supplierId!: string;
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() transporterId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() grnDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [CreateGoodsReceivedNoteLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceivedNoteLineDto)
  lines!: CreateGoodsReceivedNoteLineDto[];
}
