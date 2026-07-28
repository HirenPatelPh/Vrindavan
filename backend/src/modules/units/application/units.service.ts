import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitProps, Unit, UpdateUnitProps } from '../domain/unit.entity';
import { IUnitRepository, UNIT_REPOSITORY } from '../domain/unit.repository.interface';

@Injectable()
export class UnitsService {
  constructor(@Inject(UNIT_REPOSITORY) private readonly unitRepository: IUnitRepository) {}

  list(): Promise<Unit[]> {
    return this.unitRepository.findAll();
  }

  async getById(id: string): Promise<Unit> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new NotFoundException(`Unit ${id} not found`);
    return unit;
  }

  create(props: CreateUnitProps): Promise<Unit> {
    return this.unitRepository.create(props);
  }

  async update(id: string, props: UpdateUnitProps): Promise<Unit> {
    const updated = await this.unitRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Unit ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.unitRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Unit ${id} not found`);
  }
}
