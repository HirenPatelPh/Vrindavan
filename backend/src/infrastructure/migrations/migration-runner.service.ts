import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { Pool, PoolClient } from 'pg';

export interface MigrationFile {
  /** Path segment used as the stable identity in schema_migrations, e.g. "tenant_template/001_master_org.sql". */
  key: string;
  absolutePath: string;
  checksum: string;
}

export interface MigrateResult {
  schema: string;
  baselined: number;
  applied: string[];
  alreadyUpToDate: boolean;
}

const CANARY_TABLE = 'products';
const VALID_SCHEMA_NAME = /^(tenant_template|tenant_[a-z0-9_]+)$/;

/**
 * Applies schema changes to a tenant schema (or `tenant_template` itself).
 *
 * Phase 1 provisioned tenants by *cloning* tenant_template (pg_dump/sed/psql) — a one-time
 * operation. Everything cloned that way (tenant_template/*.sql, functions/*.sql, views/*.sql)
 * is the frozen "genesis baseline": on a schema's first encounter with this runner, those
 * files are recorded as already-applied without being re-run (the clone already put those
 * objects there). Only files under database/migrations/tenant_changes/*.sql are ever executed
 * by this runner — that's the live migration stream from Phase 2 onward.
 */
export class MigrationRunnerService {
  private readonly databaseDir: string;

  constructor(
    private readonly pool: Pool,
    databaseDir?: string,
  ) {
    // backend/src/infrastructure/migrations -> up to Vrindavan -> /database
    this.databaseDir = databaseDir ?? resolve(__dirname, '../../../../database');
  }

  private listSqlFiles(dir: string): string[] {
    try {
      return readdirSync(dir)
        .filter((f) => f.endsWith('.sql'))
        .sort();
    } catch {
      return [];
    }
  }

  private loadFile(relativeDir: string, filename: string): MigrationFile {
    const absolutePath = join(this.databaseDir, relativeDir, filename);
    const contents = readFileSync(absolutePath, 'utf8');
    return {
      key: `${relativeDir}/${filename}`,
      absolutePath,
      checksum: createHash('sha256').update(contents).digest('hex'),
    };
  }

  private getBaselineFiles(): MigrationFile[] {
    const groups: Array<[string, string[]]> = [
      ['migrations/tenant_template', this.listSqlFiles(join(this.databaseDir, 'migrations/tenant_template'))],
      ['functions', this.listSqlFiles(join(this.databaseDir, 'functions'))],
      ['views', this.listSqlFiles(join(this.databaseDir, 'views'))],
    ];
    return groups.flatMap(([dir, files]) => files.map((f) => this.loadFile(dir, f)));
  }

  private getIncrementalFiles(): MigrationFile[] {
    const dir = 'migrations/tenant_changes';
    return this.listSqlFiles(join(this.databaseDir, dir)).map((f) => this.loadFile(dir, f));
  }

  /** List of every schema this runner should keep current: tenant_template + every live tenant. */
  async listTargetSchemas(): Promise<string[]> {
    const { rows } = await this.pool.query<{ schema_name: string }>(
      `SELECT schema_name FROM public.tenants WHERE status <> 'cancelled' ORDER BY schema_name`,
    );
    return ['tenant_template', ...rows.map((r) => r.schema_name)];
  }

  async migrateAll(): Promise<MigrateResult[]> {
    const schemas = await this.listTargetSchemas();
    const results: MigrateResult[] = [];
    for (const schema of schemas) {
      results.push(await this.migrateSchema(schema));
    }
    return results;
  }

  async migrateSchema(schema: string): Promise<MigrateResult> {
    if (!VALID_SCHEMA_NAME.test(schema)) {
      throw new Error(`Refusing to migrate schema with unexpected name: "${schema}"`);
    }
    const client = await this.pool.connect();
    try {
      await this.ensureMigrationsTable(client, schema);
      const baselined = await this.baselineIfNeeded(client, schema);

      const incremental = this.getIncrementalFiles();
      const applied: string[] = [];
      for (const file of incremental) {
        const wasApplied = await this.applyIfMissing(client, schema, file);
        if (wasApplied) applied.push(file.key);
      }

      return { schema, baselined, applied, alreadyUpToDate: baselined === 0 && applied.length === 0 };
    } finally {
      client.release();
    }
  }

  private async ensureMigrationsTable(client: PoolClient, schema: string): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${schema}".schema_migrations (
        filename    text PRIMARY KEY,
        checksum    text NOT NULL,
        applied_at  timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  /**
   * On a schema's first encounter with this runner: if it already has the Phase 1 tables
   * (i.e. it was provisioned by cloning, or is tenant_template itself), record every baseline
   * file as applied without running it. Only a genuinely empty schema falls through to
   * actually executing the baseline files (not the real-world path, but keeps this runner
   * correct for a from-scratch schema too).
   */
  private async baselineIfNeeded(client: PoolClient, schema: string): Promise<number> {
    const { rows: existing } = await client.query(`SELECT filename FROM "${schema}".schema_migrations`);
    if (existing.length > 0) return 0;

    const baseline = this.getBaselineFiles();
    const { rows: canary } = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
      [schema, CANARY_TABLE],
    );
    const alreadyCloned = canary.length > 0;

    await client.query('BEGIN');
    try {
      for (const file of baseline) {
        if (!alreadyCloned) {
          const sqlText = readFileSync(file.absolutePath, 'utf8');
          await client.query(`SET search_path TO "${schema}", public`);
          await client.query(sqlText);
        }
        await client.query(
          `INSERT INTO "${schema}".schema_migrations (filename, checksum) VALUES ($1, $2)`,
          [file.key, file.checksum],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
    return baseline.length;
  }

  private async applyIfMissing(client: PoolClient, schema: string, file: MigrationFile): Promise<boolean> {
    const { rows } = await client.query<{ checksum: string }>(
      `SELECT checksum FROM "${schema}".schema_migrations WHERE filename = $1`,
      [file.key],
    );
    if (rows.length > 0) {
      if (rows[0].checksum !== file.checksum) {
        throw new Error(
          `Migration "${file.key}" has already been applied to "${schema}" but its on-disk content ` +
            `has changed since then (checksum mismatch). Never edit a shipped migration — add a new one instead.`,
        );
      }
      return false;
    }

    const sqlText = readFileSync(file.absolutePath, 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(`SET search_path TO "${schema}", public`);
      await client.query(sqlText);
      await client.query(
        `INSERT INTO "${schema}".schema_migrations (filename, checksum) VALUES ($1, $2)`,
        [file.key, file.checksum],
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
    return true;
  }
}
