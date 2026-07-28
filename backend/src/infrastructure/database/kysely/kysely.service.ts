import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './db.types';

@Injectable()
export class KyselyService implements OnModuleDestroy {
  public readonly db: Kysely<DB>;
  /** Exposed for the rare cases that need raw multi-statement execution outside Kysely's typed
   * API (migration runner, tenant provisioning) — everything else should use `db`. */
  public readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = new Pool({
      connectionString: configService.get<string>('databaseUrl'),
      statement_timeout: configService.get<number>('dbStatementTimeoutMs'),
    });
    this.db = new Kysely<DB>({
      dialect: new PostgresDialect({ pool: this.pool }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.destroy();
  }
}
