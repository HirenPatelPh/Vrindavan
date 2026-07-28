import { ApiProperty } from '@nestjs/swagger';
import { SubCategory } from '../../domain/sub-category.entity';

export class SubCategoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() categoryId: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(s: SubCategory) {
    this.id = s.id;
    this.categoryId = s.categoryId;
    this.name = s.name;
    this.code = s.code;
    this.isActive = s.isActive;
    this.createdAt = s.createdAt;
    this.updatedAt = s.updatedAt;
  }
}
