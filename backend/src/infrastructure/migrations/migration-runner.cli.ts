import 'dotenv/config';
import { Pool } from 'pg';
import { MigrationRunnerService } from './migration-runner.service';

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL env var is required to run migrations');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const runner = new MigrationRunnerService(pool);

  try {
    const results = await runner.migrateAll();
    for (const r of results) {
      if (r.alreadyUpToDate) {
        console.log(`[${r.schema}] already up to date`);
      } else {
        if (r.baselined > 0) console.log(`[${r.schema}] baselined ${r.baselined} genesis file(s)`);
        if (r.applied.length > 0) console.log(`[${r.schema}] applied: ${r.applied.join(', ')}`);
      }
    }
    console.log(`Done. ${results.length} schema(s) checked.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration run failed:', err);
  process.exit(1);
});
