import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubCategory, CreateSubCategoryProps, UpdateSubCategoryProps } from '../domain/sub-category.entity';
import { SUB_CATEGORY_REPOSITORY, ISubCategoryRepository } from '../domain/sub-category.repository.interface';

@Injectable()
export class SubCategoriesService {
  constructor(@Inject(SUB_CATEGORY_REPOSITORY) private readonly subCategoryRepository: ISubCategoryRepository) {}

  list(): Promise<SubCategory[]> {
    return this.subCategoryRepository.findAll();
  }

  async getById(id: string): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findById(id);
    if (!subCategory) throw new NotFoundException(`Sub-category ${id} not found`);
    return subCategory;
  }

  create(props: CreateSubCategoryProps): Promise<SubCategory> {
    return this.subCategoryRepository.create(props);
  }

  async update(id: string, props: UpdateSubCategoryProps): Promise<SubCategory> {
    const updated = await this.subCategoryRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Sub-category ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.subCategoryRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Sub-category ${id} not found`);
  }
}
