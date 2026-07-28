import { ProductBatch, CreateProductBatchProps, UpdateProductBatchProps } from './product-batch.entity';

export const PRODUCT_BATCH_REPOSITORY = Symbol('PRODUCT_BATCH_REPOSITORY');

export interface IProductBatchRepository {
  findAllByProduct(productId: string): Promise<ProductBatch[]>;
  findById(id: string): Promise<ProductBatch | null>;
  create(props: CreateProductBatchProps): Promise<ProductBatch>;
  update(id: string, props: UpdateProductBatchProps): Promise<ProductBatch | null>;
  delete(id: string): Promise<boolean>;
}
