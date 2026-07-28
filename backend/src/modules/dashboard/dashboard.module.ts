import { Module } from '@nestjs/common';
import { DashboardController } from './presentation/dashboard.controller';
import { DashboardService } from './application/dashboard.service';
import { DASHBOARD_REPOSITORY } from './domain/dashboard.repository.interface';
import { DashboardKyselyRepository } from './infrastructure/dashboard.kysely-repository';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, { provide: DASHBOARD_REPOSITORY, useClass: DashboardKyselyRepository }],
})
export class DashboardModule {}
