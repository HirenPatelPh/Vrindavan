import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateSalesReturnLineDto {
  @ApiProperty() @IsUUID() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() batchId?: string;
  @ApiProperty() @Type(() => Number) @Min(0.001) quantity!: number;
  @ApiProperty({ description: 'Refund/sale price for this line, used only for total_amount' })
  @Type(() => Number)
  @Min(0)
  rate!: number;
}

export class CreateSalesReturnDto {
  @ApiProperty() @IsUUID() customerId!: string;
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() salesInvoiceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() returnDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiProperty({ type: [CreateSalesReturnLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesReturnLineDto)
  lines!: CreateSalesReturnLineDto[];
}
