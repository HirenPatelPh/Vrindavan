import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Category, CreateCategoryProps, UpdateCategoryProps } from '../domain/category.entity';
import { CATEGORY_REPOSITORY, ICategoryRepository } from '../domain/category.repository.interface';

@Injectable()
export class CategoriesService {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categoryRepository: ICategoryRepository) {}

  list(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  create(props: CreateCategoryProps): Promise<Category> {
    return this.categoryRepository.create(props);
  }

  async update(id: string, props: UpdateCategoryProps): Promise<Category> {
    const updated = await this.categoryRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Category ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Category ${id} not found`);
  }
}
