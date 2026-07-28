import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Tax, CreateTaxProps, UpdateTaxProps } from '../domain/tax.entity';
import { TAX_REPOSITORY, ITaxRepository } from '../domain/tax.repository.interface';

@Injectable()
export class TaxesService {
  constructor(@Inject(TAX_REPOSITORY) private readonly taxRepository: ITaxRepository) {}

  list(): Promise<Tax[]> {
    return this.taxRepository.findAll();
  }

  async getById(id: string): Promise<Tax> {
    const tax = await this.taxRepository.findById(id);
    if (!tax) throw new NotFoundException(`Tax ${id} not found`);
    return tax;
  }

  create(props: CreateTaxProps): Promise<Tax> {
    return this.taxRepository.create(props);
  }

  async update(id: string, props: UpdateTaxProps): Promise<Tax> {
    const updated = await this.taxRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Tax ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.taxRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Tax ${id} not found`);
  }
}
