import { Module } from '@nestjs/common';
import { SuppliersController } from './presentation/suppliers.controller';
import { SuppliersService } from './application/suppliers.service';
import { SUPPLIER_REPOSITORY } from './domain/supplier.repository.interface';
import { SupplierKyselyRepository } from './infrastructure/supplier.kysely-repository';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, { provide: SUPPLIER_REPOSITORY, useClass: SupplierKyselyRepository }],
  exports: [SUPPLIER_REPOSITORY],
})
export class SuppliersModule {}
