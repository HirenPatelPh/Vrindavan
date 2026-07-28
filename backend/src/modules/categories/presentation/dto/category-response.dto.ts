import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../domain/category.entity';

export class CategoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(c: Category) {
    this.id = c.id;
    this.name = c.name;
    this.code = c.code;
    this.isActive = c.isActive;
    this.createdAt = c.createdAt;
    this.updatedAt = c.updatedAt;
  }
}
