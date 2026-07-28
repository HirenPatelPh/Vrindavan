import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductBatch, CreateProductBatchProps, UpdateProductBatchProps } from '../domain/product-batch.entity';
import { IProductBatchRepository, PRODUCT_BATCH_REPOSITORY } from '../domain/product-batch.repository.interface';

@Injectable()
export class ProductBatchesService {
  constructor(@Inject(PRODUCT_BATCH_REPOSITORY) private readonly productBatchRepository: IProductBatchRepository) {}

  list(productId: string): Promise<ProductBatch[]> {
    return this.productBatchRepository.findAllByProduct(productId);
  }

  private async getOwned(productId: string, batchId: string): Promise<ProductBatch> {
    const batch = await this.productBatchRepository.findById(batchId);
    if (!batch || batch.productId !== productId) {
      throw new NotFoundException(`Batch ${batchId} not found for this product`);
    }
    return batch;
  }

  create(productId: string, props: Omit<CreateProductBatchProps, 'productId'>): Promise<ProductBatch> {
    return this.productBatchRepository.create({ ...props, productId });
  }

  async update(productId: string, batchId: string, props: UpdateProductBatchProps): Promise<ProductBatch> {
    await this.getOwned(productId, batchId);
    const updated = await this.productBatchRepository.update(batchId, props);
    if (!updated) throw new NotFoundException(`Batch ${batchId} not found`);
    return updated;
  }

  async remove(productId: string, batchId: string): Promise<void> {
    await this.getOwned(productId, batchId);
    await this.productBatchRepository.delete(batchId);
  }
}
