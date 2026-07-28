import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ConvertToSalesOrderDto {
  @ApiProperty() @IsUUID() warehouseId!: string;
}
