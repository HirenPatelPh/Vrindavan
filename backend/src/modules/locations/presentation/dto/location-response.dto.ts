import { ApiProperty } from '@nestjs/swagger';
import { Location } from '../../domain/location.entity';

export class LocationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() rackId: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(l: Location) {
    this.id = l.id;
    this.rackId = l.rackId;
    this.name = l.name;
    this.code = l.code;
    this.isActive = l.isActive;
    this.createdAt = l.createdAt;
    this.updatedAt = l.updatedAt;
  }
}
