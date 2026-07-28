import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../domain/customer.entity';

export class CustomerResponseDto {
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
  @ApiProperty() creditLimit: number;
  @ApiProperty() creditPeriodDays: number;
  @ApiProperty() openingBalance: number;
  @ApiProperty() isBlocked: boolean;
  @ApiProperty({ nullable: true }) blockedReason: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(c: Customer) {
    this.id = c.id;
    this.name = c.name;
    this.code = c.code;
    this.contactPerson = c.contactPerson;
    this.email = c.email;
    this.phone = c.phone;
    this.gstin = c.gstin;
    this.pan = c.pan;
    this.addressLine1 = c.addressLine1;
    this.addressLine2 = c.addressLine2;
    this.city = c.city;
    this.state = c.state;
    this.country = c.country;
    this.pincode = c.pincode;
    this.creditLimit = c.creditLimit;
    this.creditPeriodDays = c.creditPeriodDays;
    this.openingBalance = c.openingBalance;
    this.isBlocked = c.isBlocked;
    this.blockedReason = c.blockedReason;
    this.isActive = c.isActive;
    this.createdAt = c.createdAt;
    this.updatedAt = c.updatedAt;
  }
}
