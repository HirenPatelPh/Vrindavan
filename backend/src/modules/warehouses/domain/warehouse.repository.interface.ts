import { Warehouse, CreateWarehouseProps, UpdateWarehouseProps } from './warehouse.entity';

export const WAREHOUSE_REPOSITORY = Symbol('WAREHOUSE_REPOSITORY');

export interface IWarehouseRepository {
  findAll(): Promise<Warehouse[]>;
  findById(id: string): Promise<Warehouse | null>;
  create(props: CreateWarehouseProps): Promise<Warehouse>;
  update(id: string, props: UpdateWarehouseProps): Promise<Warehouse | null>;
  delete(id: string): Promise<boolean>;
}
