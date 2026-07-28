import { Transporter, CreateTransporterProps, UpdateTransporterProps } from './transporter.entity';

export const TRANSPORTER_REPOSITORY = Symbol('TRANSPORTER_REPOSITORY');

export interface ITransporterRepository {
  findAll(): Promise<Transporter[]>;
  findById(id: string): Promise<Transporter | null>;
  create(props: CreateTransporterProps): Promise<Transporter>;
  update(id: string, props: UpdateTransporterProps): Promise<Transporter | null>;
  delete(id: string): Promise<boolean>;
}
