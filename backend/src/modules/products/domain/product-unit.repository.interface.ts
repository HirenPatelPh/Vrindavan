import { ProductUnit, CreateProductUnitProps, UpdateProductUnitProps } from './product-unit.entity';

export const PRODUCT_UNIT_REPOSITORY = Symbol('PRODUCT_UNIT_REPOSITORY');

export interface IProductUnitRepository {
  findAllByProduct(productId: string): Promise<ProductUnit[]>;
  findById(id: string): Promise<ProductUnit | null>;
  findByBarcode(barcode: string): Promise<ProductUnit | null>;
  create(props: CreateProductUnitProps): Promise<ProductUnit>;
  update(id: string, props: UpdateProductUnitProps): Promise<ProductUnit | null>;
  delete(id: string): Promise<boolean>;
}
