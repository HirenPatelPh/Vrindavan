import { HsnCode, CreateHsnCodeProps, UpdateHsnCodeProps } from './hsn-code.entity';

export const HSN_CODE_REPOSITORY = Symbol('HSN_CODE_REPOSITORY');

export interface IHsnCodeRepository {
  findAll(): Promise<HsnCode[]>;
  findById(id: string): Promise<HsnCode | null>;
  create(props: CreateHsnCodeProps): Promise<HsnCode>;
  update(id: string, props: UpdateHsnCodeProps): Promise<HsnCode | null>;
  delete(id: string): Promise<boolean>;
}
