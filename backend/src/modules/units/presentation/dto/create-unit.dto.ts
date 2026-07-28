import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Piece' })
  @IsString()
  @Length(1, 50)
  name!: string;

  @ApiProperty({ example: 'PCS' })
  @IsString()
  @Length(1, 10)
  shortCode!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
