import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PostOpeningStockDto {
  @ApiProperty() @IsUUID() warehouseId!: string;
}
