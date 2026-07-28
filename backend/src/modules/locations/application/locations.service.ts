import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Location, CreateLocationProps, UpdateLocationProps } from '../domain/location.entity';
import { LOCATION_REPOSITORY, ILocationRepository } from '../domain/location.repository.interface';

@Injectable()
export class LocationsService {
  constructor(@Inject(LOCATION_REPOSITORY) private readonly locationRepository: ILocationRepository) {}

  list(): Promise<Location[]> {
    return this.locationRepository.findAll();
  }

  async getById(id: string): Promise<Location> {
    const location = await this.locationRepository.findById(id);
    if (!location) throw new NotFoundException(`Location ${id} not found`);
    return location;
  }

  create(props: CreateLocationProps): Promise<Location> {
    return this.locationRepository.create(props);
  }

  async update(id: string, props: UpdateLocationProps): Promise<Location> {
    const updated = await this.locationRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Location ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.locationRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Location ${id} not found`);
  }
}
