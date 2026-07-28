import { Brand, CreateBrandProps, UpdateBrandProps } from './brand.entity';

export const BRAND_REPOSITORY = Symbol('BRAND_REPOSITORY');

export interface IBrandRepository {
  findAll(): Promise<Brand[]>;
  findById(id: string): Promise<Brand | null>;
  create(props: CreateBrandProps): Promise<Brand>;
  update(id: string, props: UpdateBrandProps): Promise<Brand | null>;
  delete(id: string): Promise<boolean>;
}
