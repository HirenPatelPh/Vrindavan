import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../products/domain/product.repository.interface';
import { OpeningStockAlreadyPostedError } from '../domain/inventory-document.errors';
import { OpeningStockKyselyRepository } from '../infrastructure/opening-stock.kysely-repository';

@Injectable()
export class OpeningStockService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: IProductRepository,
    private readonly openingStockRepository: OpeningStockKyselyRepository,
  ) {}

  async post(productId: string, warehouseId: string, postedBy?: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    if (product.openingStock <= 0) {
      throw new BadRequestException(`Product ${productId} has no positive opening stock to post`);
    }

    try {
      await this.openingStockRepository.post(productId, warehouseId, product.openingStock, product.purchasePrice, postedBy);
    } catch (error) {
      if (error instanceof OpeningStockAlreadyPostedError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
