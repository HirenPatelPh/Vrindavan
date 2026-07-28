import { Tax, CreateTaxProps, UpdateTaxProps } from './tax.entity';

export const TAX_REPOSITORY = Symbol('TAX_REPOSITORY');

export interface ITaxRepository {
  findAll(): Promise<Tax[]>;
  findById(id: string): Promise<Tax | null>;
  create(props: CreateTaxProps): Promise<Tax>;
  update(id: string, props: UpdateTaxProps): Promise<Tax | null>;
  delete(id: string): Promise<boolean>;
}
