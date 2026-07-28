import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ProductPriceHistoryService } from '../application/product-price-history.service';
import { ProductPriceHistoryResponseDto } from './dto/product-price-history-response.dto';

@ApiTags('products')
@Controller('products/:productId/price-history')
export class ProductPriceHistoryController {
  constructor(private readonly productPriceHistoryService: ProductPriceHistoryService) {}

  @RequirePermissions('products.view')
  @Get()
  async list(@Param('productId') productId: string): Promise<ProductPriceHistoryResponseDto[]> {
    const items = await this.productPriceHistoryService.list(productId);
    return items.map((i) => new ProductPriceHistoryResponseDto(i));
  }
}
