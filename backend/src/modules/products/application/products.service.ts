import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Product, CreateProductProps, UpdateProductProps } from '../domain/product.entity';
import { PRODUCT_REPOSITORY, IProductRepository } from '../domain/product.repository.interface';
import { PRODUCT_UNIT_REPOSITORY, IProductUnitRepository } from '../domain/product-unit.repository.interface';
import { PRODUCT_BARCODE_REPOSITORY, IProductBarcodeRepository } from '../domain/product-barcode.repository.interface';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_UNIT_REPOSITORY) private readonly productUnitRepository: IProductUnitRepository,
    @Inject(PRODUCT_BARCODE_REPOSITORY) private readonly productBarcodeRepository: IProductBarcodeRepository,
  ) {}

  list(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async listPaginated(page: number, limit: number): Promise<{ items: Product[]; total: number }> {
    const offset = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.productRepository.findAllPaginated(offset, limit),
      this.productRepository.count(),
    ]);
    return { items, total };
  }

  async getById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  create(props: CreateProductProps): Promise<Product> {
    return this.productRepository.create(props);
  }

  async update(id: string, props: UpdateProductProps): Promise<Product> {
    const updated = await this.productRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Product ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Product ${id} not found`);
  }

  search(query: string, limit = 20): Promise<Product[]> {
    return this.productRepository.search(query, Math.min(Math.max(limit, 1), 100));
  }

  /**
   * Checks all three barcode sources in turn — the product's own primary barcode, then
   * unit-specific barcodes (e.g. a box barcode), then additional/supplier barcodes — always
   * resolving back to the parent product. Backs "Barcode Search"/"Mobile Scanner".
   */
  async findByBarcode(barcode: string): Promise<Product> {
    const direct = await this.productRepository.findByBarcode(barcode);
    if (direct) return direct;

    const unitMatch = await this.productUnitRepository.findByBarcode(barcode);
    if (unitMatch) return this.getById(unitMatch.productId);

    const additionalMatch = await this.productBarcodeRepository.findByBarcode(barcode);
    if (additionalMatch) return this.getById(additionalMatch.productId);

    throw new NotFoundException(`No product found for barcode "${barcode}"`);
  }
}
