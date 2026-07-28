import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/** Shared productId/warehouseId filter — used by blocked-stock, reserved-stock, and the stock-balances/stock-ledger views. */
export class InventoryEntryQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() warehouseId?: string;
}
