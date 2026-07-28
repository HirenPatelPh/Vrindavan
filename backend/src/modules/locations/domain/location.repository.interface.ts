import { Location, CreateLocationProps, UpdateLocationProps } from './location.entity';

export const LOCATION_REPOSITORY = Symbol('LOCATION_REPOSITORY');

export interface ILocationRepository {
  findAll(): Promise<Location[]>;
  findById(id: string): Promise<Location | null>;
  create(props: CreateLocationProps): Promise<Location>;
  update(id: string, props: UpdateLocationProps): Promise<Location | null>;
  delete(id: string): Promise<boolean>;
}
