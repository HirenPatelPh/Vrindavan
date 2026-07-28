import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductBarcode, CreateProductBarcodeProps } from '../domain/product-barcode.entity';
import { IProductBarcodeRepository, PRODUCT_BARCODE_REPOSITORY } from '../domain/product-barcode.repository.interface';

@Injectable()
export class ProductBarcodesService {
  constructor(
    @Inject(PRODUCT_BARCODE_REPOSITORY) private readonly productBarcodeRepository: IProductBarcodeRepository,
  ) {}

  list(productId: string): Promise<ProductBarcode[]> {
    return this.productBarcodeRepository.findAllByProduct(productId);
  }

  create(productId: string, props: Omit<CreateProductBarcodeProps, 'productId'>): Promise<ProductBarcode> {
    return this.productBarcodeRepository.create({ ...props, productId });
  }

  async remove(productId: string, barcodeId: string): Promise<void> {
    const barcode = await this.productBarcodeRepository.findById(barcodeId);
    if (!barcode || barcode.productId !== productId) {
      throw new NotFoundException(`Barcode ${barcodeId} not found for this product`);
    }
    await this.productBarcodeRepository.delete(barcodeId);
  }
}
