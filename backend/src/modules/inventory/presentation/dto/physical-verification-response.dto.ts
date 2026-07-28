import { ApiProperty } from '@nestjs/swagger';
import {
  PhysicalVerification,
  PhysicalVerificationLine,
  PhysicalVerificationStatus,
} from '../../domain/physical-verification.entity';

class PhysicalVerificationLineResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) batchId: string | null;
  @ApiProperty({ nullable: true }) rackId: string | null;
  @ApiProperty({ nullable: true }) locationId: string | null;
  @ApiProperty() systemQuantity: number;
  @ApiProperty() countedQuantity: number;
  @ApiProperty({ nullable: true }) difference: number | null;
  @ApiProperty({ nullable: true }) remarks: string | null;

  constructor(l: PhysicalVerificationLine) {
    this.id = l.id;
    this.productId = l.productId;
    this.batchId = l.batchId;
    this.rackId = l.rackId;
    this.locationId = l.locationId;
    this.systemQuantity = l.systemQuantity;
    this.countedQuantity = l.countedQuantity;
    this.difference = l.difference;
    this.remarks = l.remarks;
  }
}

export class PhysicalVerificationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() verificationNumber: string;
  @ApiProperty() verificationDate: Date;
  @ApiProperty() warehouseId: string;
  @ApiProperty() status: PhysicalVerificationStatus;
  @ApiProperty({ nullable: true }) completedAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [PhysicalVerificationLineResponseDto] }) lines: PhysicalVerificationLineResponseDto[];

  constructor(v: PhysicalVerification) {
    this.id = v.id;
    this.verificationNumber = v.verificationNumber;
    this.verificationDate = v.verificationDate;
    this.warehouseId = v.warehouseId;
    this.status = v.status;
    this.completedAt = v.completedAt;
    this.createdAt = v.createdAt;
    this.updatedAt = v.updatedAt;
    this.lines = v.lines.map((l) => new PhysicalVerificationLineResponseDto(l));
  }
}
