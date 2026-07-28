import { Module } from '@nestjs/common';
import { BranchesController } from './presentation/branches.controller';
import { BranchesService } from './application/branches.service';
import { BRANCH_REPOSITORY } from './domain/branch.repository.interface';
import { BranchKyselyRepository } from './infrastructure/branch.kysely-repository';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService, { provide: BRANCH_REPOSITORY, useClass: BranchKyselyRepository }],
  exports: [BRANCH_REPOSITORY],
})
export class BranchesModule {}
