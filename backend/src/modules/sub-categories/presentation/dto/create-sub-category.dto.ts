import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty() @IsUUID() categoryId!: string;
  @ApiProperty() @IsString() @Length(1, 100) name!: string;
  @ApiProperty() @IsString() @Length(1, 30) code!: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
