import { ApiProperty } from '@nestjs/swagger';
import { HsnCode } from '../../domain/hsn-code.entity';

export class HsnCodeResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) defaultGstId: string | null;
  @ApiProperty() isActive: boolean;

  constructor(h: HsnCode) {
    this.id = h.id;
    this.code = h.code;
    this.description = h.description;
    this.defaultGstId = h.defaultGstId;
    this.isActive = h.isActive;
  }
}
