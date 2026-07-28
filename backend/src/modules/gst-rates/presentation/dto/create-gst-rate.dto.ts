import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateGstRateDto {
  @ApiProperty({ example: 'GST 18%' }) @IsString() @Length(1, 30) name!: string;
  @ApiProperty({ example: 18 }) @IsNumber() @Min(0) totalRate!: number;
  @ApiProperty({ example: 9 }) @IsNumber() @Min(0) cgstRate!: number;
  @ApiProperty({ example: 9 }) @IsNumber() @Min(0) sgstRate!: number;
  @ApiProperty({ example: 18 }) @IsNumber() @Min(0) igstRate!: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
