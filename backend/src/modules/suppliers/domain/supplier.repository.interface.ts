import { Supplier, CreateSupplierProps, UpdateSupplierProps } from './supplier.entity';

export const SUPPLIER_REPOSITORY = Symbol('SUPPLIER_REPOSITORY');

export interface ISupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  create(props: CreateSupplierProps): Promise<Supplier>;
  update(id: string, props: UpdateSupplierProps): Promise<Supplier | null>;
  delete(id: string): Promise<boolean>;
}
