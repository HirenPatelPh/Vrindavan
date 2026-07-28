import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CategoriesService } from '../application/categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @RequirePermissions('categories.view')
  @Get()
  async list(): Promise<CategoryResponseDto[]> {
    const items = await this.categoriesService.list();
    return items.map((i) => new CategoryResponseDto(i));
  }

  @RequirePermissions('categories.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return new CategoryResponseDto(await this.categoriesService.getById(id));
  }

  @RequirePermissions('categories.create')
  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return new CategoryResponseDto(await this.categoriesService.create(dto));
  }

  @RequirePermissions('categories.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    return new CategoryResponseDto(await this.categoriesService.update(id, dto));
  }

  @RequirePermissions('categories.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
