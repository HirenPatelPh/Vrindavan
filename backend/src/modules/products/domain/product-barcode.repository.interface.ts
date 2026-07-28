import { ProductBarcode, CreateProductBarcodeProps } from './product-barcode.entity';

export const PRODUCT_BARCODE_REPOSITORY = Symbol('PRODUCT_BARCODE_REPOSITORY');

export interface IProductBarcodeRepository {
  findAllByProduct(productId: string): Promise<ProductBarcode[]>;
  findById(id: string): Promise<ProductBarcode | null>;
  findByBarcode(barcode: string): Promise<ProductBarcode | null>;
  create(props: CreateProductBarcodeProps): Promise<ProductBarcode>;
  delete(id: string): Promise<boolean>;
}
