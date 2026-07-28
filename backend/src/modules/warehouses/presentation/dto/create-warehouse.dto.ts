import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty() @IsUUID() branchId!: string;
  @ApiProperty() @IsString() @Length(1, 150) name!: string;
  @ApiProperty() @IsString() @Length(1, 30) code!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 200) addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 20) pincode?: string;
  @ApiPropertyOptional({ description: 'Employee id of the warehouse manager' })
  @IsOptional()
  @IsUUID()
  managerId?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
