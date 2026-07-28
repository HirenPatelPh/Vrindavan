import { ApiProperty } from '@nestjs/swagger';
import { GstRate } from '../../domain/gst-rate.entity';

export class GstRateResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() totalRate: number;
  @ApiProperty() cgstRate: number;
  @ApiProperty() sgstRate: number;
  @ApiProperty() igstRate: number;
  @ApiProperty() isActive: boolean;

  constructor(g: GstRate) {
    this.id = g.id;
    this.name = g.name;
    this.totalRate = g.totalRate;
    this.cgstRate = g.cgstRate;
    this.sgstRate = g.sgstRate;
    this.igstRate = g.igstRate;
    this.isActive = g.isActive;
  }
}
