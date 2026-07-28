import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ProductBarcodesService } from '../application/product-barcodes.service';
import { CreateProductBarcodeDto } from './dto/create-product-barcode.dto';
import { ProductBarcodeResponseDto } from './dto/product-barcode-response.dto';

@ApiTags('products')
@Controller('products/:productId/barcodes')
export class ProductBarcodesController {
  constructor(private readonly productBarcodesService: ProductBarcodesService) {}

  @RequirePermissions('products.view')
  @Get()
  async list(@Param('productId') productId: string): Promise<ProductBarcodeResponseDto[]> {
    const items = await this.productBarcodesService.list(productId);
    return items.map((i) => new ProductBarcodeResponseDto(i));
  }

  @RequirePermissions('products.edit')
  @Post()
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductBarcodeDto,
  ): Promise<ProductBarcodeResponseDto> {
    return new ProductBarcodeResponseDto(await this.productBarcodesService.create(productId, dto));
  }

  @RequirePermissions('products.edit')
  @Delete(':barcodeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('productId') productId: string, @Param('barcodeId') barcodeId: string): Promise<void> {
    await this.productBarcodesService.remove(productId, barcodeId);
  }
}
