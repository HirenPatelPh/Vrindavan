import { ApiProperty } from '@nestjs/swagger';
import { Tax, TaxType } from '../../domain/tax.entity';

export class TaxResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() taxType: TaxType;
  @ApiProperty() rate: number;
  @ApiProperty() isActive: boolean;

  constructor(t: Tax) {
    this.id = t.id;
    this.name = t.name;
    this.taxType = t.taxType;
    this.rate = t.rate;
    this.isActive = t.isActive;
  }
}
