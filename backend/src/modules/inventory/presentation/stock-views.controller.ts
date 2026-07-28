import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { StockViewsService } from '../application/stock-views.service';
import { InventoryEntryQueryDto } from './dto/inventory-entry-query.dto';
import { StockLedgerQueryDto } from './dto/stock-ledger-query.dto';
import { StockBalanceResponseDto } from './dto/stock-balance-response.dto';
import { StockLedgerResponseDto } from './dto/stock-ledger-response.dto';

@ApiTags('inventory')
@Controller('inventory')
export class StockViewsController {
  constructor(private readonly stockViewsService: StockViewsService) {}

  @RequirePermissions('inventory.view')
  @Get('stock-balances')
  async getStockBalances(@Query() query: InventoryEntryQueryDto): Promise<StockBalanceResponseDto[]> {
    const rows = await this.stockViewsService.getCurrentStock(query);
    return rows.map((r) => new StockBalanceResponseDto(r));
  }

  @RequirePermissions('inventory.view')
  @Get('stock-ledger')
  async getStockLedger(@Query() query: StockLedgerQueryDto): Promise<StockLedgerResponseDto[]> {
    const rows = await this.stockViewsService.getLedger(query);
    return rows.map((r) => new StockLedgerResponseDto(r));
  }
}
