import { Customer, CreateCustomerProps, UpdateCustomerProps } from './customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface ICustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  create(props: CreateCustomerProps): Promise<Customer>;
  update(id: string, props: UpdateCustomerProps): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
}
