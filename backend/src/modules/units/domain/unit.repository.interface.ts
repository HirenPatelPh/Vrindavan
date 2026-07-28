import { CreateUnitProps, Unit, UpdateUnitProps } from './unit.entity';

export const UNIT_REPOSITORY = Symbol('UNIT_REPOSITORY');

export interface IUnitRepository {
  findAll(): Promise<Unit[]>;
  findById(id: string): Promise<Unit | null>;
  create(props: CreateUnitProps): Promise<Unit>;
  update(id: string, props: UpdateUnitProps): Promise<Unit | null>;
  delete(id: string): Promise<boolean>;
}
