import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { ReservedStockService } from '../application/reserved-stock.service';
import { CreateReservedStockDto } from './dto/create-reserved-stock.dto';
import { ReservedStockResponseDto } from './dto/reserved-stock-response.dto';
import { InventoryEntryQueryDto } from './dto/inventory-entry-query.dto';

@ApiTags('inventory')
@Controller('inventory/reserved-stock')
export class ReservedStockController {
  constructor(private readonly reservedStockService: ReservedStockService) {}

  @RequirePermissions('reserved_stock.view')
  @Get()
  async list(@Query() query: InventoryEntryQueryDto): Promise<ReservedStockResponseDto[]> {
    const items = await this.reservedStockService.list(query);
    return items.map((i) => new ReservedStockResponseDto(i));
  }

  @RequirePermissions('reserved_stock.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<ReservedStockResponseDto> {
    return new ReservedStockResponseDto(await this.reservedStockService.getById(id));
  }

  @RequirePermissions('reserved_stock.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateReservedStockDto,
  ): Promise<ReservedStockResponseDto> {
    return new ReservedStockResponseDto(await this.reservedStockService.create(dto, user.sub));
  }

  @RequirePermissions('reserved_stock.edit')
  @Post(':id/release')
  async release(@Param('id') id: string): Promise<ReservedStockResponseDto> {
    return new ReservedStockResponseDto(await this.reservedStockService.release(id));
  }
}
