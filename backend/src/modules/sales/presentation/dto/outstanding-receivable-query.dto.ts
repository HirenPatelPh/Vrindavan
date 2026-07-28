import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class OutstandingReceivableQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() customerId?: string;
}
