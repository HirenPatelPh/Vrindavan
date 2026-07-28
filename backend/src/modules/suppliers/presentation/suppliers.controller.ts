import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { SuppliersService } from '../application/suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @RequirePermissions('suppliers.view')
  @Get()
  async list(): Promise<SupplierResponseDto[]> {
    const items = await this.suppliersService.list();
    return items.map((i) => new SupplierResponseDto(i));
  }

  @RequirePermissions('suppliers.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<SupplierResponseDto> {
    return new SupplierResponseDto(await this.suppliersService.getById(id));
  }

  @RequirePermissions('suppliers.create')
  @Post()
  async create(@Body() dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return new SupplierResponseDto(await this.suppliersService.create(dto));
  }

  @RequirePermissions('suppliers.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    return new SupplierResponseDto(await this.suppliersService.update(id, dto));
  }

  @RequirePermissions('suppliers.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.suppliersService.remove(id);
  }
}
