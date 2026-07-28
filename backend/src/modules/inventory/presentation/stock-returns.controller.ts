import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { StockReturnsService } from '../application/stock-returns.service';
import { CreateStockReturnDto } from './dto/create-stock-return.dto';
import { StockReturnResponseDto } from './dto/stock-return-response.dto';

@ApiTags('inventory')
@Controller('inventory/stock-returns')
export class StockReturnsController {
  constructor(private readonly stockReturnsService: StockReturnsService) {}

  @RequirePermissions('stock_returns.view')
  @Get()
  async list(): Promise<StockReturnResponseDto[]> {
    const items = await this.stockReturnsService.list();
    return items.map((i) => new StockReturnResponseDto(i));
  }

  @RequirePermissions('stock_returns.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<StockReturnResponseDto> {
    return new StockReturnResponseDto(await this.stockReturnsService.getById(id));
  }

  @RequirePermissions('stock_returns.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateStockReturnDto,
  ): Promise<StockReturnResponseDto> {
    return new StockReturnResponseDto(await this.stockReturnsService.create(dto, user.sub));
  }

  @RequirePermissions('stock_returns.approve')
  @Post(':id/approve')
  async approve(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<StockReturnResponseDto> {
    return new StockReturnResponseDto(await this.stockReturnsService.approve(id, user.sub));
  }

  @RequirePermissions('stock_returns.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.stockReturnsService.remove(id);
  }
}
