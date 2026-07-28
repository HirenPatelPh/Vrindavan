import { Module } from '@nestjs/common';
import { ReportsController } from './presentation/reports.controller';
import { ReportsService } from './application/reports.service';
import { REPORTS_REPOSITORY } from './domain/report.repository.interface';
import { ReportsKyselyRepository } from './infrastructure/reports.kysely-repository';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, { provide: REPORTS_REPOSITORY, useClass: ReportsKyselyRepository }],
})
export class ReportsModule {}
