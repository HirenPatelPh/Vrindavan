import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Brand, CreateBrandProps, UpdateBrandProps } from '../domain/brand.entity';
import { BRAND_REPOSITORY, IBrandRepository } from '../domain/brand.repository.interface';

@Injectable()
export class BrandsService {
  constructor(@Inject(BRAND_REPOSITORY) private readonly brandRepository: IBrandRepository) {}

  list(): Promise<Brand[]> {
    return this.brandRepository.findAll();
  }

  async getById(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    return brand;
  }

  create(props: CreateBrandProps): Promise<Brand> {
    return this.brandRepository.create(props);
  }

  async update(id: string, props: UpdateBrandProps): Promise<Brand> {
    const updated = await this.brandRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Brand ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.brandRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Brand ${id} not found`);
  }
}
