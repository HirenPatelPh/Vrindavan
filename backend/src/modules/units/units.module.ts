import { Module } from '@nestjs/common';
import { UnitsController } from './presentation/units.controller';
import { UnitsService } from './application/units.service';
import { UNIT_REPOSITORY } from './domain/unit.repository.interface';
import { UnitKyselyRepository } from './infrastructure/unit.kysely-repository';

@Module({
  controllers: [UnitsController],
  providers: [UnitsService, { provide: UNIT_REPOSITORY, useClass: UnitKyselyRepository }],
})
export class UnitsModule {}
