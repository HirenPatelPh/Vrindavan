import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ProductBatchesService } from '../application/product-batches.service';
import { CreateProductBatchDto } from './dto/create-product-batch.dto';
import { UpdateProductBatchDto } from './dto/update-product-batch.dto';
import { ProductBatchResponseDto } from './dto/product-batch-response.dto';

@ApiTags('products')
@Controller('products/:productId/batches')
export class ProductBatchesController {
  constructor(private readonly productBatchesService: ProductBatchesService) {}

  @RequirePermissions('products.view')
  @Get()
  async list(@Param('productId') productId: string): Promise<ProductBatchResponseDto[]> {
    const items = await this.productBatchesService.list(productId);
    return items.map((i) => new ProductBatchResponseDto(i));
  }

  @RequirePermissions('products.edit')
  @Post()
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductBatchDto,
  ): Promise<ProductBatchResponseDto> {
    return new ProductBatchResponseDto(await this.productBatchesService.create(productId, dto));
  }

  @RequirePermissions('products.edit')
  @Patch(':batchId')
  async update(
    @Param('productId') productId: string,
    @Param('batchId') batchId: string,
    @Body() dto: UpdateProductBatchDto,
  ): Promise<ProductBatchResponseDto> {
    return new ProductBatchResponseDto(await this.productBatchesService.update(productId, batchId, dto));
  }

  @RequirePermissions('products.edit')
  @Delete(':batchId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('productId') productId: string, @Param('batchId') batchId: string): Promise<void> {
    await this.productBatchesService.remove(productId, batchId);
  }
}
