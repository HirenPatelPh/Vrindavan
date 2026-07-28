import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { StockAdjustmentsService } from '../application/stock-adjustments.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { StockAdjustmentResponseDto } from './dto/stock-adjustment-response.dto';

@ApiTags('inventory')
@Controller('inventory/stock-adjustments')
export class StockAdjustmentsController {
  constructor(private readonly stockAdjustmentsService: StockAdjustmentsService) {}

  @RequirePermissions('stock_adjustments.view')
  @Get()
  async list(): Promise<StockAdjustmentResponseDto[]> {
    const items = await this.stockAdjustmentsService.list();
    return items.map((i) => new StockAdjustmentResponseDto(i));
  }

  @RequirePermissions('stock_adjustments.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<StockAdjustmentResponseDto> {
    return new StockAdjustmentResponseDto(await this.stockAdjustmentsService.getById(id));
  }

  @RequirePermissions('stock_adjustments.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateStockAdjustmentDto,
  ): Promise<StockAdjustmentResponseDto> {
    return new StockAdjustmentResponseDto(await this.stockAdjustmentsService.create(dto, user.sub));
  }

  @RequirePermissions('stock_adjustments.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<StockAdjustmentResponseDto> {
    return new StockAdjustmentResponseDto(await this.stockAdjustmentsService.approve(id, user.sub));
  }

  @RequirePermissions('stock_adjustments.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.stockAdjustmentsService.remove(id);
  }
}
