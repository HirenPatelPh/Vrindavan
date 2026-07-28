import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateBlockedStockDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() rackId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty({ example: 'Quality hold pending inspection' }) @IsString() @Length(1, 500) reason!: string;
}
