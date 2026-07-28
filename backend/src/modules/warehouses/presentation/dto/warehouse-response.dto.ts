import { ApiProperty } from '@nestjs/swagger';
import { Warehouse } from '../../domain/warehouse.entity';

export class WarehouseResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() branchId: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty({ nullable: true }) addressLine1: string | null;
  @ApiProperty({ nullable: true }) city: string | null;
  @ApiProperty({ nullable: true }) state: string | null;
  @ApiProperty({ nullable: true }) pincode: string | null;
  @ApiProperty({ nullable: true }) managerId: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(w: Warehouse) {
    this.id = w.id;
    this.branchId = w.branchId;
    this.name = w.name;
    this.code = w.code;
    this.addressLine1 = w.addressLine1;
    this.city = w.city;
    this.state = w.state;
    this.pincode = w.pincode;
    this.managerId = w.managerId;
    this.isActive = w.isActive;
    this.createdAt = w.createdAt;
    this.updatedAt = w.updatedAt;
  }
}
