import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierPaymentProps, SupplierPayment } from '../domain/supplier-payment.entity';
import { ISupplierPaymentRepository, SUPPLIER_PAYMENT_REPOSITORY } from '../domain/supplier-payment.repository.interface';
import { InvalidAllocationError } from '../domain/purchase-document.errors';

@Injectable()
export class SupplierPaymentsService {
  constructor(
    @Inject(SUPPLIER_PAYMENT_REPOSITORY) private readonly supplierPaymentRepository: ISupplierPaymentRepository,
  ) {}

  list(): Promise<SupplierPayment[]> {
    return this.supplierPaymentRepository.findAll();
  }

  async getById(id: string): Promise<SupplierPayment> {
    const payment = await this.supplierPaymentRepository.findById(id);
    if (!payment) throw new NotFoundException(`Supplier payment ${id} not found`);
    return payment;
  }

  async create(props: CreateSupplierPaymentProps, createdBy?: string): Promise<SupplierPayment> {
    try {
      return await this.supplierPaymentRepository.createWithAllocations(props, createdBy);
    } catch (error) {
      if (error instanceof InvalidAllocationError) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
