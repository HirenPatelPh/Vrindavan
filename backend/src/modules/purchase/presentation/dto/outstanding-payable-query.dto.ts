import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class OutstandingPayableQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() supplierId?: string;
}
