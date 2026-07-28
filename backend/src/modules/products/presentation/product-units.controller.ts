import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ProductUnitsService } from '../application/product-units.service';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { ProductUnitResponseDto } from './dto/product-unit-response.dto';

@ApiTags('products')
@Controller('products/:productId/units')
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  @RequirePermissions('products.view')
  @Get()
  async list(@Param('productId') productId: string): Promise<ProductUnitResponseDto[]> {
    const items = await this.productUnitsService.list(productId);
    return items.map((i) => new ProductUnitResponseDto(i));
  }

  @RequirePermissions('products.edit')
  @Post()
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductUnitDto,
  ): Promise<ProductUnitResponseDto> {
    return new ProductUnitResponseDto(await this.productUnitsService.create(productId, dto));
  }

  @RequirePermissions('products.edit')
  @Patch(':unitRowId')
  async update(
    @Param('productId') productId: string,
    @Param('unitRowId') unitRowId: string,
    @Body() dto: UpdateProductUnitDto,
  ): Promise<ProductUnitResponseDto> {
    return new ProductUnitResponseDto(await this.productUnitsService.update(productId, unitRowId, dto));
  }

  @RequirePermissions('products.edit')
  @Delete(':unitRowId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('productId') productId: string, @Param('unitRowId') unitRowId: string): Promise<void> {
    await this.productUnitsService.remove(productId, unitRowId);
  }
}
