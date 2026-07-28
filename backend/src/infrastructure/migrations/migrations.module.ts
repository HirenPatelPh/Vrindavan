import { Module } from '@nestjs/common';
import { KyselyService } from '../database/kysely/kysely.service';
import { MigrationRunnerService } from './migration-runner.service';

/**
 * MigrationRunnerService itself stays a plain, framework-agnostic class (it's also
 * instantiated standalone by migration-runner.cli.ts without booting Nest at all) — this
 * module just wraps it in a factory provider, reusing KyselyService's existing pool instead
 * of opening a second one, for the one place the running app needs it: TenantProvisioningService
 * catching a freshly-cloned tenant up to the latest tenant_changes/*.sql (see modules/signup).
 */
@Module({
  providers: [
    {
      provide: MigrationRunnerService,
      useFactory: (kyselyService: KyselyService) => new MigrationRunnerService(kyselyService.pool),
      inject: [KyselyService],
    },
  ],
  exports: [MigrationRunnerService],
})
export class MigrationsModule {}
