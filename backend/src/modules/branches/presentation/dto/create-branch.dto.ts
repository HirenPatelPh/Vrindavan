import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty() @IsString() @Length(1, 150) name!: string;
  @ApiProperty() @IsString() @Length(1, 30) code!: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isHeadOffice?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 200) addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 200) addressLine2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 20) pincode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
