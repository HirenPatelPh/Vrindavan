import { Module } from '@nestjs/common';
import { WarehousesController } from './presentation/warehouses.controller';
import { WarehousesService } from './application/warehouses.service';
import { WAREHOUSE_REPOSITORY } from './domain/warehouse.repository.interface';
import { WarehouseKyselyRepository } from './infrastructure/warehouse.kysely-repository';

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesService, { provide: WAREHOUSE_REPOSITORY, useClass: WarehouseKyselyRepository }],
  exports: [WAREHOUSE_REPOSITORY],
})
export class WarehousesModule {}
