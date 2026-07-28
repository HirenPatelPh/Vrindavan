import { Module } from '@nestjs/common';
import { TaxesController } from './presentation/taxes.controller';
import { TaxesService } from './application/taxes.service';
import { TAX_REPOSITORY } from './domain/tax.repository.interface';
import { TaxKyselyRepository } from './infrastructure/tax.kysely-repository';

@Module({
  controllers: [TaxesController],
  providers: [TaxesService, { provide: TAX_REPOSITORY, useClass: TaxKyselyRepository }],
  exports: [TAX_REPOSITORY],
})
export class TaxesModule {}
