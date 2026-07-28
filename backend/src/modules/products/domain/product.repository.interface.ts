import { Product, CreateProductProps, UpdateProductProps } from './product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findAllPaginated(offset: number, limit: number): Promise<Product[]>;
  count(): Promise<number>;
  findById(id: string): Promise<Product | null>;
  create(props: CreateProductProps): Promise<Product>;
  update(id: string, props: UpdateProductProps): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  /** Trigram partial match on name/sku — "Quick Product Finder". */
  search(query: string, limit: number): Promise<Product[]>;
  /** Exact match on products.barcode only (unit/additional barcodes are checked by the service, not here). */
  findByBarcode(barcode: string): Promise<Product | null>;
}
