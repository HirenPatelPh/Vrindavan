import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductUnit, CreateProductUnitProps, UpdateProductUnitProps } from '../domain/product-unit.entity';
import { IProductUnitRepository, PRODUCT_UNIT_REPOSITORY } from '../domain/product-unit.repository.interface';

@Injectable()
export class ProductUnitsService {
  constructor(@Inject(PRODUCT_UNIT_REPOSITORY) private readonly productUnitRepository: IProductUnitRepository) {}

  list(productId: string): Promise<ProductUnit[]> {
    return this.productUnitRepository.findAllByProduct(productId);
  }

  private async getOwned(productId: string, unitRowId: string): Promise<ProductUnit> {
    const unit = await this.productUnitRepository.findById(unitRowId);
    if (!unit || unit.productId !== productId) {
      throw new NotFoundException(`Product unit ${unitRowId} not found for this product`);
    }
    return unit;
  }

  create(productId: string, props: Omit<CreateProductUnitProps, 'productId'>): Promise<ProductUnit> {
    return this.productUnitRepository.create({ ...props, productId });
  }

  async update(productId: string, unitRowId: string, props: UpdateProductUnitProps): Promise<ProductUnit> {
    await this.getOwned(productId, unitRowId);
    const updated = await this.productUnitRepository.update(unitRowId, props);
    if (!updated) throw new NotFoundException(`Product unit ${unitRowId} not found`);
    return updated;
  }

  async remove(productId: string, unitRowId: string): Promise<void> {
    await this.getOwned(productId, unitRowId);
    await this.productUnitRepository.delete(unitRowId);
  }
}
