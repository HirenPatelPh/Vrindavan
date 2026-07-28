import { ApiProperty } from '@nestjs/swagger';
import { CompanyProfile } from '../../domain/company-profile.entity';

export class CompanyProfileResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() companyCode: string;
  @ApiProperty() companyName: string;
  @ApiProperty() companyEmail: string;
  @ApiProperty({ nullable: true }) companyPhone: string | null;
  @ApiProperty({ nullable: true }) logoUrl: string | null;
  @ApiProperty({ nullable: true }) primaryColor: string | null;
  @ApiProperty() timezone: string;
  @ApiProperty() plan: string;
  @ApiProperty() status: string;

  constructor(company: CompanyProfile) {
    this.id = company.id;
    this.companyCode = company.companyCode;
    this.companyName = company.companyName;
    this.companyEmail = company.companyEmail;
    this.companyPhone = company.companyPhone;
    this.logoUrl = company.logoUrl;
    this.primaryColor = company.primaryColor;
    this.timezone = company.timezone;
    this.plan = company.plan;
    this.status = company.status;
  }
}
