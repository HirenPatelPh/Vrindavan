import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty() @IsString() @Length(1, 200) name!: string;
  @ApiProperty() @IsString() @Length(1, 30) code!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 150) contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 20) gstin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 15) pan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 200) addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 200) addressLine2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 20) pincode?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) creditLimit?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) creditPeriodDays?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() openingBalance?: number;
  @ApiPropertyOptional({ default: false, description: '"Customer Name Blocking" feature' })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() blockedReason?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
