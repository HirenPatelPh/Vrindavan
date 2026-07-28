import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transporter, CreateTransporterProps, UpdateTransporterProps } from '../domain/transporter.entity';
import { TRANSPORTER_REPOSITORY, ITransporterRepository } from '../domain/transporter.repository.interface';

@Injectable()
export class TransportersService {
  constructor(@Inject(TRANSPORTER_REPOSITORY) private readonly transporterRepository: ITransporterRepository) {}

  list(): Promise<Transporter[]> {
    return this.transporterRepository.findAll();
  }

  async getById(id: string): Promise<Transporter> {
    const transporter = await this.transporterRepository.findById(id);
    if (!transporter) throw new NotFoundException(`Transporter ${id} not found`);
    return transporter;
  }

  create(props: CreateTransporterProps): Promise<Transporter> {
    return this.transporterRepository.create(props);
  }

  async update(id: string, props: UpdateTransporterProps): Promise<Transporter> {
    const updated = await this.transporterRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Transporter ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.transporterRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Transporter ${id} not found`);
  }
}
