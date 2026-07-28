import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { TaxType } from '../../domain/tax.entity';

const TAX_TYPES: TaxType[] = ['gst', 'vat', 'cess', 'custom_duty', 'other'];

export class CreateTaxDto {
  @ApiProperty() @IsString() @Length(1, 50) name!: string;
  @ApiProperty({ enum: TAX_TYPES }) @IsIn(TAX_TYPES) taxType!: TaxType;
  @ApiProperty() @IsNumber() @Min(0) rate!: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
