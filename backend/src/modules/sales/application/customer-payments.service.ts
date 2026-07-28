import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerPaymentProps, CustomerPayment } from '../domain/customer-payment.entity';
import {
  CUSTOMER_PAYMENT_REPOSITORY,
  ICustomerPaymentRepository,
} from '../domain/customer-payment.repository.interface';
import { InvalidAllocationError } from '../domain/sales-document.errors';

@Injectable()
export class CustomerPaymentsService {
  constructor(
    @Inject(CUSTOMER_PAYMENT_REPOSITORY) private readonly customerPaymentRepository: ICustomerPaymentRepository,
  ) {}

  list(): Promise<CustomerPayment[]> {
    return this.customerPaymentRepository.findAll();
  }

  async getById(id: string): Promise<CustomerPayment> {
    const payment = await this.customerPaymentRepository.findById(id);
    if (!payment) throw new NotFoundException(`Customer payment ${id} not found`);
    return payment;
  }

  async create(props: CreateCustomerPaymentProps, createdBy?: string): Promise<CustomerPayment> {
    try {
      return await this.customerPaymentRepository.createWithAllocations(props, createdBy);
    } catch (error) {
      if (error instanceof InvalidAllocationError) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
