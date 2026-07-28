import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { SubCategoriesService } from '../application/sub-categories.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryResponseDto } from './dto/sub-category-response.dto';

@ApiTags('sub-categories')
@Controller('sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @RequirePermissions('sub_categories.view')
  @Get()
  async list(): Promise<SubCategoryResponseDto[]> {
    const items = await this.subCategoriesService.list();
    return items.map((i) => new SubCategoryResponseDto(i));
  }

  @RequirePermissions('sub_categories.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<SubCategoryResponseDto> {
    return new SubCategoryResponseDto(await this.subCategoriesService.getById(id));
  }

  @RequirePermissions('sub_categories.create')
  @Post()
  async create(@Body() dto: CreateSubCategoryDto): Promise<SubCategoryResponseDto> {
    return new SubCategoryResponseDto(await this.subCategoriesService.create(dto));
  }

  @RequirePermissions('sub_categories.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto): Promise<SubCategoryResponseDto> {
    return new SubCategoryResponseDto(await this.subCategoriesService.update(id, dto));
  }

  @RequirePermissions('sub_categories.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.subCategoriesService.remove(id);
  }
}
