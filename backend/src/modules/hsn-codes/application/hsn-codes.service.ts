import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HsnCode, CreateHsnCodeProps, UpdateHsnCodeProps } from '../domain/hsn-code.entity';
import { HSN_CODE_REPOSITORY, IHsnCodeRepository } from '../domain/hsn-code.repository.interface';

@Injectable()
export class HsnCodesService {
  constructor(@Inject(HSN_CODE_REPOSITORY) private readonly hsnCodeRepository: IHsnCodeRepository) {}

  list(): Promise<HsnCode[]> {
    return this.hsnCodeRepository.findAll();
  }

  async getById(id: string): Promise<HsnCode> {
    const hsnCode = await this.hsnCodeRepository.findById(id);
    if (!hsnCode) throw new NotFoundException(`HSN code ${id} not found`);
    return hsnCode;
  }

  create(props: CreateHsnCodeProps): Promise<HsnCode> {
    return this.hsnCodeRepository.create(props);
  }

  async update(id: string, props: UpdateHsnCodeProps): Promise<HsnCode> {
    const updated = await this.hsnCodeRepository.update(id, props);
    if (!updated) throw new NotFoundException(`HSN code ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.hsnCodeRepository.delete(id);
    if (!deleted) throw new NotFoundException(`HSN code ${id} not found`);
  }
}
