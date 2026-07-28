import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { DamagedStockService } from '../application/damaged-stock.service';
import { CreateDamagedStockDto } from './dto/create-damaged-stock.dto';
import { DamagedStockResponseDto } from './dto/damaged-stock-response.dto';

@ApiTags('inventory')
@Controller('inventory/damaged-stock')
export class DamagedStockController {
  constructor(private readonly damagedStockService: DamagedStockService) {}

  @RequirePermissions('damaged_stock.view')
  @Get()
  async list(): Promise<DamagedStockResponseDto[]> {
    const items = await this.damagedStockService.list();
    return items.map((i) => new DamagedStockResponseDto(i));
  }

  @RequirePermissions('damaged_stock.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<DamagedStockResponseDto> {
    return new DamagedStockResponseDto(await this.damagedStockService.getById(id));
  }

  @RequirePermissions('damaged_stock.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateDamagedStockDto,
  ): Promise<DamagedStockResponseDto> {
    return new DamagedStockResponseDto(await this.damagedStockService.create(dto, user.sub));
  }

  @RequirePermissions('damaged_stock.approve')
  @Post(':id/approve')
  async approve(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<DamagedStockResponseDto> {
    return new DamagedStockResponseDto(await this.damagedStockService.approve(id, user.sub));
  }

  @RequirePermissions('damaged_stock.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.damagedStockService.remove(id);
  }
}
