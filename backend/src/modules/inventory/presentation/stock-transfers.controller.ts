import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { StockTransfersService } from '../application/stock-transfers.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { StockTransferResponseDto } from './dto/stock-transfer-response.dto';

@ApiTags('inventory')
@Controller('inventory/stock-transfers')
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @RequirePermissions('stock_transfers.view')
  @Get()
  async list(): Promise<StockTransferResponseDto[]> {
    const items = await this.stockTransfersService.list();
    return items.map((i) => new StockTransferResponseDto(i));
  }

  @RequirePermissions('stock_transfers.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<StockTransferResponseDto> {
    return new StockTransferResponseDto(await this.stockTransfersService.getById(id));
  }

  @RequirePermissions('stock_transfers.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateStockTransferDto,
  ): Promise<StockTransferResponseDto> {
    return new StockTransferResponseDto(await this.stockTransfersService.create(dto, user.sub));
  }

  @RequirePermissions('stock_transfers.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<StockTransferResponseDto> {
    return new StockTransferResponseDto(await this.stockTransfersService.approve(id, user.sub));
  }

  @RequirePermissions('stock_transfers.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.stockTransfersService.remove(id);
  }
}
