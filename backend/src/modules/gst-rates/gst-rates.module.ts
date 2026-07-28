import { Module } from '@nestjs/common';
import { GstRatesController } from './presentation/gst-rates.controller';
import { GstRatesService } from './application/gst-rates.service';
import { GST_RATE_REPOSITORY } from './domain/gst-rate.repository.interface';
import { GstRateKyselyRepository } from './infrastructure/gst-rate.kysely-repository';

@Module({
  controllers: [GstRatesController],
  providers: [GstRatesService, { provide: GST_RATE_REPOSITORY, useClass: GstRateKyselyRepository }],
  exports: [GST_RATE_REPOSITORY],
})
export class GstRatesModule {}
