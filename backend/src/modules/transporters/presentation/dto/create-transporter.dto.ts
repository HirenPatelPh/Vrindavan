import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateTransporterDto {
  @ApiProperty() @IsString() @Length(1, 150) name!: string;
  @ApiProperty() @IsString() @Length(1, 30) code!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 150) contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 30) vehicleNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 20) gstNumber?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
