import { Module } from '@nestjs/common';
import { CategoriesController } from './presentation/categories.controller';
import { CategoriesService } from './application/categories.service';
import { CATEGORY_REPOSITORY } from './domain/category.repository.interface';
import { CategoryKyselyRepository } from './infrastructure/category.kysely-repository';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, { provide: CATEGORY_REPOSITORY, useClass: CategoryKyselyRepository }],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
