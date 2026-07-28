import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { TaxesService } from '../application/taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { TaxResponseDto } from './dto/tax-response.dto';

@ApiTags('taxes')
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @RequirePermissions('taxes.view')
  @Get()
  async list(): Promise<TaxResponseDto[]> {
    const items = await this.taxesService.list();
    return items.map((i) => new TaxResponseDto(i));
  }

  @RequirePermissions('taxes.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<TaxResponseDto> {
    return new TaxResponseDto(await this.taxesService.getById(id));
  }

  @RequirePermissions('taxes.create')
  @Post()
  async create(@Body() dto: CreateTaxDto): Promise<TaxResponseDto> {
    return new TaxResponseDto(await this.taxesService.create(dto));
  }

  @RequirePermissions('taxes.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaxDto): Promise<TaxResponseDto> {
    return new TaxResponseDto(await this.taxesService.update(id, dto));
  }

  @RequirePermissions('taxes.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.taxesService.remove(id);
  }
}
