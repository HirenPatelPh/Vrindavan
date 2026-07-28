import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateRackDto {
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiProperty() @IsString() @Length(1, 100) name!: string;
  @ApiProperty() @IsString() @Length(1, 30) code!: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
