import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { WarehousesService } from '../application/warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseResponseDto } from './dto/warehouse-response.dto';

@ApiTags('warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @RequirePermissions('warehouses.view')
  @Get()
  async list(): Promise<WarehouseResponseDto[]> {
    const items = await this.warehousesService.list();
    return items.map((i) => new WarehouseResponseDto(i));
  }

  @RequirePermissions('warehouses.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<WarehouseResponseDto> {
    return new WarehouseResponseDto(await this.warehousesService.getById(id));
  }

  @RequirePermissions('warehouses.create')
  @Post()
  async create(@Body() dto: CreateWarehouseDto): Promise<WarehouseResponseDto> {
    return new WarehouseResponseDto(await this.warehousesService.create(dto));
  }

  @RequirePermissions('warehouses.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto): Promise<WarehouseResponseDto> {
    return new WarehouseResponseDto(await this.warehousesService.update(id, dto));
  }

  @RequirePermissions('warehouses.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.warehousesService.remove(id);
  }
}
