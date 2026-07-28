import { Module } from '@nestjs/common';
import { BrandsController } from './presentation/brands.controller';
import { BrandsService } from './application/brands.service';
import { BRAND_REPOSITORY } from './domain/brand.repository.interface';
import { BrandKyselyRepository } from './infrastructure/brand.kysely-repository';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, { provide: BRAND_REPOSITORY, useClass: BrandKyselyRepository }],
  exports: [BRAND_REPOSITORY],
})
export class BrandsModule {}
