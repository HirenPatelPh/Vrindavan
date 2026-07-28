import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductImage } from '../domain/product-image.entity';
import { IProductImageRepository, PRODUCT_IMAGE_REPOSITORY } from '../domain/product-image.repository.interface';
import { LocalFileStorageService } from '../infrastructure/local-file-storage.service';

@Injectable()
export class ProductImagesService {
  constructor(
    @Inject(PRODUCT_IMAGE_REPOSITORY) private readonly productImageRepository: IProductImageRepository,
    private readonly fileStorage: LocalFileStorageService,
  ) {}

  list(productId: string): Promise<ProductImage[]> {
    return this.productImageRepository.findAllByProduct(productId);
  }

  async upload(productId: string, storedFilename: string, isPrimary: boolean): Promise<ProductImage> {
    const imageUrl = this.fileStorage.publicUrlFor(productId, storedFilename);
    if (isPrimary) {
      await this.productImageRepository.unsetPrimaryForProduct(productId);
    }
    return this.productImageRepository.create({ productId, imageUrl, isPrimary });
  }

  private async getOwned(productId: string, imageId: string): Promise<ProductImage> {
    const image = await this.productImageRepository.findById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundException(`Image ${imageId} not found for this product`);
    }
    return image;
  }

  async setPrimary(productId: string, imageId: string): Promise<ProductImage> {
    await this.getOwned(productId, imageId);
    await this.productImageRepository.unsetPrimaryForProduct(productId);
    const updated = await this.productImageRepository.setPrimary(imageId);
    if (!updated) throw new NotFoundException(`Image ${imageId} not found`);
    return updated;
  }

  async remove(productId: string, imageId: string): Promise<void> {
    const image = await this.getOwned(productId, imageId);
    await this.productImageRepository.delete(imageId);
    await this.fileStorage.deleteByPublicUrl(image.imageUrl);
  }
}
