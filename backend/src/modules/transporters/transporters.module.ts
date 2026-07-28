import { Module } from '@nestjs/common';
import { TransportersController } from './presentation/transporters.controller';
import { TransportersService } from './application/transporters.service';
import { TRANSPORTER_REPOSITORY } from './domain/transporter.repository.interface';
import { TransporterKyselyRepository } from './infrastructure/transporter.kysely-repository';

@Module({
  controllers: [TransportersController],
  providers: [TransportersService, { provide: TRANSPORTER_REPOSITORY, useClass: TransporterKyselyRepository }],
  exports: [TRANSPORTER_REPOSITORY],
})
export class TransportersModule {}
