import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Supplier, CreateSupplierProps, UpdateSupplierProps } from '../domain/supplier.entity';
import { SUPPLIER_REPOSITORY, ISupplierRepository } from '../domain/supplier.repository.interface';

@Injectable()
export class SuppliersService {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly supplierRepository: ISupplierRepository) {}

  list(): Promise<Supplier[]> {
    return this.supplierRepository.findAll();
  }

  async getById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  create(props: CreateSupplierProps): Promise<Supplier> {
    return this.supplierRepository.create(props);
  }

  async update(id: string, props: UpdateSupplierProps): Promise<Supplier> {
    const updated = await this.supplierRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Supplier ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.supplierRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Supplier ${id} not found`);
  }
}
