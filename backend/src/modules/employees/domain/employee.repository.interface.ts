import { Employee, CreateEmployeeProps, UpdateEmployeeProps } from './employee.entity';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface IEmployeeRepository {
  findAll(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  create(props: CreateEmployeeProps): Promise<Employee>;
  update(id: string, props: UpdateEmployeeProps): Promise<Employee | null>;
  delete(id: string): Promise<boolean>;
}
