import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { BrandsService } from '../application/brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @RequirePermissions('brands.view')
  @Get()
  async list(): Promise<BrandResponseDto[]> {
    const items = await this.brandsService.list();
    return items.map((i) => new BrandResponseDto(i));
  }

  @RequirePermissions('brands.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<BrandResponseDto> {
    return new BrandResponseDto(await this.brandsService.getById(id));
  }

  @RequirePermissions('brands.create')
  @Post()
  async create(@Body() dto: CreateBrandDto): Promise<BrandResponseDto> {
    return new BrandResponseDto(await this.brandsService.create(dto));
  }

  @RequirePermissions('brands.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto): Promise<BrandResponseDto> {
    return new BrandResponseDto(await this.brandsService.update(id, dto));
  }

  @RequirePermissions('brands.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.brandsService.remove(id);
  }
}
