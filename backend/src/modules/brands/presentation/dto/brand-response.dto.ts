import { ApiProperty } from '@nestjs/swagger';
import { Brand } from '../../domain/brand.entity';

export class BrandResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty({ nullable: true }) logoUrl: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(b: Brand) {
    this.id = b.id;
    this.name = b.name;
    this.code = b.code;
    this.logoUrl = b.logoUrl;
    this.isActive = b.isActive;
    this.createdAt = b.createdAt;
    this.updatedAt = b.updatedAt;
  }
}
