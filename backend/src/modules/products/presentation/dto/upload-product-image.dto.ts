import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class UploadProductImageDto {
  @ApiPropertyOptional({ default: false, description: 'Make this the product\'s primary image' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isPrimary?: boolean;
}
