import { ApiProperty } from '@nestjs/swagger';
import { Unit } from '../../domain/unit.entity';

export class UnitResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() shortCode: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(unit: Unit) {
    this.id = unit.id;
    this.name = unit.name;
    this.shortCode = unit.shortCode;
    this.isActive = unit.isActive;
    this.createdAt = unit.createdAt;
    this.updatedAt = unit.updatedAt;
  }
}
