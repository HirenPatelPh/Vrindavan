import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../../domain/employee.entity';

export class EmployeeResponseDto {
  @ApiProperty({ nullable: true }) userId: string | null;
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty({ nullable: true }) designation: string | null;
  @ApiProperty({ nullable: true }) department: string | null;
  @ApiProperty({ nullable: true }) phone: string | null;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty({ nullable: true }) joiningDate: Date | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(e: Employee) {
    this.id = e.id;
    this.userId = e.userId;
    this.name = e.name;
    this.code = e.code;
    this.designation = e.designation;
    this.department = e.department;
    this.phone = e.phone;
    this.email = e.email;
    this.joiningDate = e.joiningDate;
    this.isActive = e.isActive;
    this.createdAt = e.createdAt;
    this.updatedAt = e.updatedAt;
  }
}
