import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class CreateProductBatchDto {
  @ApiProperty() @IsString() @Length(1, 60) batchNumber!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 60) lotNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() manufacturingDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
}
