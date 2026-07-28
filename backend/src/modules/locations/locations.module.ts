import { Module } from '@nestjs/common';
import { LocationsController } from './presentation/locations.controller';
import { LocationsService } from './application/locations.service';
import { LOCATION_REPOSITORY } from './domain/location.repository.interface';
import { LocationKyselyRepository } from './infrastructure/location.kysely-repository';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, { provide: LOCATION_REPOSITORY, useClass: LocationKyselyRepository }],
  exports: [LOCATION_REPOSITORY],
})
export class LocationsModule {}
