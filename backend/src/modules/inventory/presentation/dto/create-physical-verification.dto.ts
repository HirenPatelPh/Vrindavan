import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreatePhysicalVerificationLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() rackId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiProperty({ description: 'The physically counted quantity' }) @Type(() => Number) @Min(0) countedQuantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class CreatePhysicalVerificationDto {
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() verificationDate?: string;
  @ApiProperty({ type: [CreatePhysicalVerificationLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePhysicalVerificationLineDto)
  lines!: CreatePhysicalVerificationLineDto[];
}
