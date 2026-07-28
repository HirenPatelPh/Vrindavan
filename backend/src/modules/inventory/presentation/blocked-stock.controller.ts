import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { BlockedStockService } from '../application/blocked-stock.service';
import { CreateBlockedStockDto } from './dto/create-blocked-stock.dto';
import { BlockedStockResponseDto } from './dto/blocked-stock-response.dto';
import { InventoryEntryQueryDto } from './dto/inventory-entry-query.dto';

@ApiTags('inventory')
@Controller('inventory/blocked-stock')
export class BlockedStockController {
  constructor(private readonly blockedStockService: BlockedStockService) {}

  @RequirePermissions('blocked_stock.view')
  @Get()
  async list(@Query() query: InventoryEntryQueryDto): Promise<BlockedStockResponseDto[]> {
    const items = await this.blockedStockService.list(query);
    return items.map((i) => new BlockedStockResponseDto(i));
  }

  @RequirePermissions('blocked_stock.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlockedStockResponseDto> {
    return new BlockedStockResponseDto(await this.blockedStockService.getById(id));
  }

  @RequirePermissions('blocked_stock.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateBlockedStockDto,
  ): Promise<BlockedStockResponseDto> {
    return new BlockedStockResponseDto(await this.blockedStockService.create(dto, user.sub));
  }

  @RequirePermissions('blocked_stock.edit')
  @Post(':id/release')
  async release(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<BlockedStockResponseDto> {
    return new BlockedStockResponseDto(await this.blockedStockService.release(id, user.sub));
  }
}
