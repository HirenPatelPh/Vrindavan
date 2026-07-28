import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Branch, CreateBranchProps, UpdateBranchProps } from '../domain/branch.entity';
import { BRANCH_REPOSITORY, IBranchRepository } from '../domain/branch.repository.interface';

@Injectable()
export class BranchesService {
  constructor(@Inject(BRANCH_REPOSITORY) private readonly branchRepository: IBranchRepository) {}

  list(): Promise<Branch[]> {
    return this.branchRepository.findAll();
  }

  async getById(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    return branch;
  }

  create(props: CreateBranchProps): Promise<Branch> {
    return this.branchRepository.create(props);
  }

  async update(id: string, props: UpdateBranchProps): Promise<Branch> {
    const updated = await this.branchRepository.update(id, props);
    if (!updated) throw new NotFoundException(`Branch ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.branchRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Branch ${id} not found`);
  }
}
