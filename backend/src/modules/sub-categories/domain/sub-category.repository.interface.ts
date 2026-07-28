import { SubCategory, CreateSubCategoryProps, UpdateSubCategoryProps } from './sub-category.entity';

export const SUB_CATEGORY_REPOSITORY = Symbol('SUB_CATEGORY_REPOSITORY');

export interface ISubCategoryRepository {
  findAll(): Promise<SubCategory[]>;
  findById(id: string): Promise<SubCategory | null>;
  create(props: CreateSubCategoryProps): Promise<SubCategory>;
  update(id: string, props: UpdateSubCategoryProps): Promise<SubCategory | null>;
  delete(id: string): Promise<boolean>;
}
