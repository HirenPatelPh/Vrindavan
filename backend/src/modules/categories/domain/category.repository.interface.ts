import { Category, CreateCategoryProps, UpdateCategoryProps } from './category.entity';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(props: CreateCategoryProps): Promise<Category>;
  update(id: string, props: UpdateCategoryProps): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
}
