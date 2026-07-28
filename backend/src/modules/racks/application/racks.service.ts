import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Rack, CreateRackProps, UpdateRackProps } from '../domain/rack.entity';
import { RACK_REPOSITORY, IRackRepository } from '../domain/rack.repository.interface';

@Injectable()
export class RacksService {
  constructor(@Inject(RACK_REPOSITORY) private readonly rackRepository: IRackRepository) {}

  list(): Promise<Rack[]> {
    return this.rackRepository.findAll();
  }

  async getById(id: string): Promise<Rack> {
    const rack = await this.rackRepository.findById(id);
    if (!rack) throw new NotFoundException(`Rack ${id} not found`);
    return rack;
  }

  create(props: CreateRackProps): Promise<Rack> {
    return this.rackRepository.create(props);
  }

  async update(id: string, props: UpdateRackProps): Promise<Rack> {
    const updated = await this.rackRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Rack ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.rackRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Rack ${id} not found`);
  }
}
