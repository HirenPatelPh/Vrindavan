import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Warehouse, CreateWarehouseProps, UpdateWarehouseProps } from '../domain/warehouse.entity';
import { WAREHOUSE_REPOSITORY, IWarehouseRepository } from '../domain/warehouse.repository.interface';

@Injectable()
export class WarehousesService {
  constructor(@Inject(WAREHOUSE_REPOSITORY) private readonly warehouseRepository: IWarehouseRepository) {}

  list(): Promise<Warehouse[]> {
    return this.warehouseRepository.findAll();
  }

  async getById(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) throw new NotFoundException(`Warehouse ${id} not found`);
    return warehouse;
  }

  create(props: CreateWarehouseProps): Promise<Warehouse> {
    return this.warehouseRepository.create(props);
  }

  async update(id: string, props: UpdateWarehouseProps): Promise<Warehouse> {
    const updated = await this.warehouseRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Warehouse ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.warehouseRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Warehouse ${id} not found`);
  }
}
