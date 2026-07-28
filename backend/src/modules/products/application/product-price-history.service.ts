import { Inject, Injectable } from '@nestjs/common';
import { ProductPriceHistoryEntry } from '../domain/product-price-history.entity';
import {
  IProductPriceHistoryRepository,
  PRODUCT_PRICE_HISTORY_REPOSITORY,
} from '../domain/product-price-history.repository.interface';

@Injectable()
export class ProductPriceHistoryService {
  constructor(
    @Inject(PRODUCT_PRICE_HISTORY_REPOSITORY)
    private readonly productPriceHistoryRepository: IProductPriceHistoryRepository,
  ) {}

  list(productId: string): Promise<ProductPriceHistoryEntry[]> {
    return this.productPriceHistoryRepository.findAllByProduct(productId);
  }
}
