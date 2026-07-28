import { ProductImage, CreateProductImageProps } from './product-image.entity';

export const PRODUCT_IMAGE_REPOSITORY = Symbol('PRODUCT_IMAGE_REPOSITORY');

export interface IProductImageRepository {
  findAllByProduct(productId: string): Promise<ProductImage[]>;
  findById(id: string): Promise<ProductImage | null>;
  create(props: CreateProductImageProps): Promise<ProductImage>;
  /** Demotes any currently-primary image for this product — call before setPrimary/create-as-primary. */
  unsetPrimaryForProduct(productId: string): Promise<void>;
  setPrimary(id: string): Promise<ProductImage | null>;
  delete(id: string): Promise<boolean>;
}
