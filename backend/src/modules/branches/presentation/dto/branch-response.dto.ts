import { ApiProperty } from '@nestjs/swagger';
import { Branch } from '../../domain/branch.entity';

export class BranchResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty() isHeadOffice: boolean;
  @ApiProperty({ nullable: true }) addressLine1: string | null;
  @ApiProperty({ nullable: true }) addressLine2: string | null;
  @ApiProperty({ nullable: true }) city: string | null;
  @ApiProperty({ nullable: true }) state: string | null;
  @ApiProperty({ nullable: true }) country: string | null;
  @ApiProperty({ nullable: true }) pincode: string | null;
  @ApiProperty({ nullable: true }) phone: string | null;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(branch: Branch) {
    this.id = branch.id;
    this.name = branch.name;
    this.code = branch.code;
    this.isHeadOffice = branch.isHeadOffice;
    this.addressLine1 = branch.addressLine1;
    this.addressLine2 = branch.addressLine2;
    this.city = branch.city;
    this.state = branch.state;
    this.country = branch.country;
    this.pincode = branch.pincode;
    this.phone = branch.phone;
    this.email = branch.email;
    this.isActive = branch.isActive;
    this.createdAt = branch.createdAt;
    this.updatedAt = branch.updatedAt;
  }
}
