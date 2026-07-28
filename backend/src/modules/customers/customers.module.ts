import { Module } from '@nestjs/common';
import { CustomersController } from './presentation/customers.controller';
import { CustomersService } from './application/customers.service';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository.interface';
import { CustomerKyselyRepository } from './infrastructure/customer.kysely-repository';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, { provide: CUSTOMER_REPOSITORY, useClass: CustomerKyselyRepository }],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
