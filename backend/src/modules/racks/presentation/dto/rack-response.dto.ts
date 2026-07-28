import { ApiProperty } from '@nestjs/swagger';
import { Rack } from '../../domain/rack.entity';

export class RackResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(r: Rack) {
    this.id = r.id;
    this.warehouseId = r.warehouseId;
    this.name = r.name;
    this.code = r.code;
    this.isActive = r.isActive;
    this.createdAt = r.createdAt;
    this.updatedAt = r.updatedAt;
  }
}
