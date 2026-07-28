import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateEmployeeDto {
  @ApiPropertyOptional({ description: 'Links this employee to a login user, if they have one' })
  @IsOptional()
  @IsUUID()
  userId?: string;
  @ApiProperty() @IsString() @Length(1, 150) name!: string;
  @ApiProperty() @IsString() @Length(1, 30) code!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) designation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 100) department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() joiningDate?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
