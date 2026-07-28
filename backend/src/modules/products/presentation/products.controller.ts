import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ProductsService } from '../application/products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchProductQueryDto } from './dto/search-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { PaginatedProductResponseDto } from './dto/paginated-product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // NOTE: /search and /barcode/:code must stay declared before /:id, otherwise Nest's
  // routing would try to match "search"/"barcode" as a product id.
  @RequirePermissions('products.view')
  @Get('search')
  async search(@Query() query: SearchProductQueryDto): Promise<ProductResponseDto[]> {
    const items = await this.productsService.search(query.q ?? '', query.limit);
    return items.map((i) => new ProductResponseDto(i));
  }

  @RequirePermissions('products.view')
  @Get('barcode/:code')
  async findByBarcode(@Param('code') code: string): Promise<ProductResponseDto> {
    return new ProductResponseDto(await this.productsService.findByBarcode(code));
  }

  // Pagination is opt-in via `page` — omitted entirely, this returns the same full unpaginated
  // array as always, since every FK picker in the app (Purchase/Sales/Inventory line pickers,
  // Product's own unit-scoped barcode picker) reads this endpoint that way and must not see a
  // shape change.
  @RequirePermissions('products.view')
  @Get()
  async list(@Query() query: ListProductsQueryDto): Promise<ProductResponseDto[] | PaginatedProductResponseDto> {
    if (query.page !== undefined) {
      const limit = query.limit ?? 12;
      const { items, total } = await this.productsService.listPaginated(query.page, limit);
      return new PaginatedProductResponseDto(items.map((i) => new ProductResponseDto(i)), total, query.page, limit);
    }
    const items = await this.productsService.list();
    return items.map((i) => new ProductResponseDto(i));
  }

  @RequirePermissions('products.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProductResponseDto> {
    return new ProductResponseDto(await this.productsService.getById(id));
  }

  @RequirePermissions('products.create')
  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return new ProductResponseDto(await this.productsService.create(dto));
  }

  @RequirePermissions('products.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<ProductResponseDto> {
    return new ProductResponseDto(await this.productsService.update(id, dto));
  }

  @RequirePermissions('products.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}
