import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Customer, CreateCustomerProps, UpdateCustomerProps } from '../domain/customer.entity';
import { CUSTOMER_REPOSITORY, ICustomerRepository } from '../domain/customer.repository.interface';

@Injectable()
export class CustomersService {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: ICustomerRepository) {}

  list(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async getById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  create(props: CreateCustomerProps): Promise<Customer> {
    return this.customerRepository.create(props);
  }

  async update(id: string, props: UpdateCustomerProps): Promise<Customer> {
    const updated = await this.customerRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Customer ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.customerRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Customer ${id} not found`);
  }
}
