import { Rack, CreateRackProps, UpdateRackProps } from './rack.entity';

export const RACK_REPOSITORY = Symbol('RACK_REPOSITORY');

export interface IRackRepository {
  findAll(): Promise<Rack[]>;
  findById(id: string): Promise<Rack | null>;
  create(props: CreateRackProps): Promise<Rack>;
  update(id: string, props: UpdateRackProps): Promise<Rack | null>;
  delete(id: string): Promise<boolean>;
}
