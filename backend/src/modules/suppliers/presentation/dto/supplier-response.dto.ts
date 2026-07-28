import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from '../../domain/supplier.entity';

export class SupplierResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty({ nullable: true }) contactPerson: string | null;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty({ nullable: true }) phone: string | null;
  @ApiProperty({ nullable: true }) gstin: string | null;
  @ApiProperty({ nullable: true }) pan: string | null;
  @ApiProperty({ nullable: true }) addressLine1: string | null;
  @ApiProperty({ nullable: true }) addressLine2: string | null;
  @ApiProperty({ nullable: true }) city: string | null;
  @ApiProperty({ nullable: true }) state: string | null;
  @ApiProperty({ nullable: true }) country: string | null;
  @ApiProperty({ nullable: true }) pincode: string | null;
  @ApiProperty() creditPeriodDays: number;
  @ApiProperty() openingBalance: number;
  @ApiProperty() isBlocked: boolean;
  @ApiProperty({ nullable: true }) blockedReason: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(s: Supplier) {
    this.id = s.id;
    this.name = s.name;
    this.code = s.code;
    this.contactPerson = s.contactPerson;
    this.email = s.email;
    this.phone = s.phone;
    this.gstin = s.gstin;
    this.pan = s.pan;
    this.addressLine1 = s.addressLine1;
    this.addressLine2 = s.addressLine2;
    this.city = s.city;
    this.state = s.state;
    this.country = s.country;
    this.pincode = s.pincode;
    this.creditPeriodDays = s.creditPeriodDays;
    this.openingBalance = s.openingBalance;
    this.isBlocked = s.isBlocked;
    this.blockedReason = s.blockedReason;
    this.isActive = s.isActive;
    this.createdAt = s.createdAt;
    this.updatedAt = s.updatedAt;
  }
}
