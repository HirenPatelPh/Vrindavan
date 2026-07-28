import { ApiProperty } from '@nestjs/swagger';
import { Transporter } from '../../domain/transporter.entity';

export class TransporterResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty({ nullable: true }) contactPerson: string | null;
  @ApiProperty({ nullable: true }) phone: string | null;
  @ApiProperty({ nullable: true }) vehicleNumber: string | null;
  @ApiProperty({ nullable: true }) gstNumber: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(t: Transporter) {
    this.id = t.id;
    this.name = t.name;
    this.code = t.code;
    this.contactPerson = t.contactPerson;
    this.phone = t.phone;
    this.vehicleNumber = t.vehicleNumber;
    this.gstNumber = t.gstNumber;
    this.isActive = t.isActive;
    this.createdAt = t.createdAt;
    this.updatedAt = t.updatedAt;
  }
}
