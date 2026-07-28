import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReportDateRangeDto {
  @ApiProperty() @IsDateString() fromDate!: string;
  @ApiProperty() @IsDateString() toDate!: string;
}

export class SalesRegisterQueryDto extends ReportDateRangeDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() customerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class PurchaseRegisterQueryDto extends ReportDateRangeDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() supplierId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}
