import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { BarcodeType } from '../../domain/product-barcode.entity';

const BARCODE_TYPES: BarcodeType[] = ['ean13', 'code128', 'qr', 'upc', 'other'];

export class CreateProductBarcodeDto {
  @ApiPropertyOptional({ description: 'Ties this barcode to a specific alternate unit (e.g. box barcode)' })
  @IsOptional()
  @IsUUID()
  productUnitId?: string;
  @ApiProperty() @IsString() @Length(1, 50) barcode!: string;
  @ApiPropertyOptional({ enum: BARCODE_TYPES, default: 'ean13' })
  @IsOptional()
  @IsIn(BARCODE_TYPES)
  barcodeType?: BarcodeType;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isPrimary?: boolean;
}
