import { Module } from '@nestjs/common';
import { RacksController } from './presentation/racks.controller';
import { RacksService } from './application/racks.service';
import { RACK_REPOSITORY } from './domain/rack.repository.interface';
import { RackKyselyRepository } from './infrastructure/rack.kysely-repository';

@Module({
  controllers: [RacksController],
  providers: [RacksService, { provide: RACK_REPOSITORY, useClass: RackKyselyRepository }],
  exports: [RACK_REPOSITORY],
})
export class RacksModule {}
