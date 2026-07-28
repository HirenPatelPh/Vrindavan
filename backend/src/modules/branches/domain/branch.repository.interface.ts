import { Branch, CreateBranchProps, UpdateBranchProps } from './branch.entity';

export const BRANCH_REPOSITORY = Symbol('BRANCH_REPOSITORY');

export interface IBranchRepository {
  findAll(): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  create(props: CreateBranchProps): Promise<Branch>;
  update(id: string, props: UpdateBranchProps): Promise<Branch | null>;
  delete(id: string): Promise<boolean>;
}
