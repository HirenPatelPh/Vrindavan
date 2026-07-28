import { Module } from '@nestjs/common';
import { SubCategoriesController } from './presentation/sub-categories.controller';
import { SubCategoriesService } from './application/sub-categories.service';
import { SUB_CATEGORY_REPOSITORY } from './domain/sub-category.repository.interface';
import { SubCategoryKyselyRepository } from './infrastructure/sub-category.kysely-repository';

@Module({
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService, { provide: SUB_CATEGORY_REPOSITORY, useClass: SubCategoryKyselyRepository }],
  exports: [SUB_CATEGORY_REPOSITORY],
})
export class SubCategoriesModule {}
