import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Employee, CreateEmployeeProps, UpdateEmployeeProps } from '../domain/employee.entity';
import { EMPLOYEE_REPOSITORY, IEmployeeRepository } from '../domain/employee.repository.interface';

@Injectable()
export class EmployeesService {
  constructor(@Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository) {}

  list(): Promise<Employee[]> {
    return this.employeeRepository.findAll();
  }

  async getById(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return employee;
  }

  create(props: CreateEmployeeProps): Promise<Employee> {
    return this.employeeRepository.create(props);
  }

  async update(id: string, props: UpdateEmployeeProps): Promise<Employee> {
    const updated = await this.employeeRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Employee ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.employeeRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Employee ${id} not found`);
  }
}
