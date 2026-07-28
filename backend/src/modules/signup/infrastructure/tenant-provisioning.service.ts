import { execFile, spawn } from 'child_process';
import { join, resolve } from 'path';
import { promisify } from 'util';
import { ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'kysely';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';
import { KyselyService } from '../../../infrastructure/database/kysely/kysely.service';
import { MigrationRunnerService } from '../../../infrastructure/migrations/migration-runner.service';
import {
  AppClsStore,
  pgQuoteIdent,
} from '../../../infrastructure/database/tenant-context/tenant-cls-store';
import { AuthResult, AuthService } from '../../auth/application/auth.service';
import { PasswordHasherService } from '../../auth/infrastructure/password-hasher.service';
import { IUserRepository, USER_REPOSITORY } from '../../auth/domain/user.repository.interface';
import { SignupDto } from '../presentation/dto/signup.dto';

const execFileAsync = promisify(execFile);
const SEED_DIR = resolve(__dirname, '../../../../../database/seed');
const SEED_FILES = ['001_roles_permissions.sql', '002_units_tax.sql', '003_financial_year.sql'];

/**
 * The public-signup equivalent of database/scripts/provision_tenant.sh (Phase 1) — same four
 * conceptual steps (register, clone, seed, activate), reimplemented as error-handled Node so
 * `POST /auth/signup` can drive it directly, plus a fifth step (create the first Admin user +
 * auto-login) that only makes sense from application code. The shell script is unchanged and
 * still available for ops/manual provisioning.
 *
 * Requires `pg_dump` and `psql` on PATH — same requirement the shell script already has.
 */
@Injectable()
export class TenantProvisioningService {
  constructor(
    private readonly kysely: KyselyService,
    private readonly migrationRunner: MigrationRunnerService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService<AppClsStore>,
    private readonly authService: AuthService,
    private readonly passwordHasher: PasswordHasherService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TenantProvisioningService.name);
  }

  async signup(dto: SignupDto): Promise<AuthResult> {
    const existing = await this.kysely.pool.query('SELECT 1 FROM public.tenants WHERE company_code = $1', [
      dto.companyCode,
    ]);
    if ((existing.rowCount ?? 0) > 0) {
      throw new ConflictException(`Company code "${dto.companyCode}" is already taken`);
    }

    const registered = await this.kysely.pool.query<{ tenant_id: string; schema_name: string }>(
      'SELECT tenant_id, schema_name FROM public.fn_register_tenant($1, $2, $3)',
      [dto.companyCode, dto.companyName, dto.companyEmail],
    );
    const { tenant_id: tenantId, schema_name: schemaName } = registered.rows[0];

    try {
      await this.cloneSchema(schemaName);
      await this.seedSchema(schemaName);
      await this.migrationRunner.migrateSchema(schemaName);
    } catch (err) {
      await this.logProvisioningStep(tenantId, 'clone_schema', 'failed', (err as Error).message);
      this.logger.error({ err, tenantId, schemaName }, 'Tenant schema provisioning failed');
      throw new InternalServerErrorException('Failed to provision company. Please try again.');
    }
    await this.logProvisioningStep(tenantId, 'clone_schema', 'success');

    const authResult = await this.createAdminAndLogin(tenantId, schemaName, dto.companyCode, dto);

    await this.kysely.pool.query(`UPDATE public.tenants SET status = 'active' WHERE id = $1`, [tenantId]);
    await this.logProvisioningStep(tenantId, 'activate', 'success');

    return authResult;
  }

  private async cloneSchema(schemaName: string): Promise<void> {
    const databaseUrl = this.configService.get<string>('databaseUrl')!;
    const { stdout } = await execFileAsync(
      'pg_dump',
      ['--schema-only', '--schema=tenant_template', '--no-owner', '--no-privileges', databaseUrl],
      { maxBuffer: 1024 * 1024 * 50 },
    );
    const cloned = stdout.replaceAll('tenant_template', schemaName);
    // Piped through `psql`, not executed via the raw pool: modern pg_dump (PG18+) emits
    // `\restrict`/`\unrestrict` meta-commands that only psql understands, not valid SQL a
    // driver connection can execute — same reason the shell script pipes to psql too.
    await this.runPsqlStdin(databaseUrl, cloned);
  }

  private runPsqlStdin(databaseUrl: string, sqlText: string): Promise<void> {
    return new Promise((resolvePromise, reject) => {
      const child = spawn('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1'], { stdio: ['pipe', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolvePromise();
        else reject(new Error(`psql exited with code ${code}: ${stderr}`));
      });
      child.stdin.write(sqlText);
      child.stdin.end();
    });
  }

  private async seedSchema(schemaName: string): Promise<void> {
    const databaseUrl = this.configService.get<string>('databaseUrl')!;
    for (const file of SEED_FILES) {
      await execFileAsync('psql', [
        databaseUrl,
        '-v',
        `schema=${schemaName}`,
        '-v',
        'ON_ERROR_STOP=1',
        '-f',
        join(SEED_DIR, file),
      ]);
    }
  }

  /**
   * Creates the first user directly against the new schema and mints tokens — bypassing the
   * usual per-request TenantConnectionInterceptor entirely, since a signup request carries
   * neither an `x-company-code` header nor a JWT (there's nothing to resolve a tenant from
   * yet). This opens the same kind of single-connection scope the interceptor normally would,
   * just triggered explicitly instead of automatically.
   */
  private async createAdminAndLogin(
    tenantId: string,
    schemaName: string,
    companyCode: string,
    dto: SignupDto,
  ): Promise<AuthResult> {
    const passwordHash = await this.passwordHasher.hash(dto.adminPassword);

    return this.kysely.db.connection().execute(async (scopedDb) => {
      await sql.raw(`SET search_path TO ${pgQuoteIdent(schemaName)}, public`).execute(scopedDb);
      this.cls.set('tenantId', tenantId);
      this.cls.set('schemaName', schemaName);
      this.cls.set('companyCode', companyCode);
      this.cls.set('tenantDb', scopedDb);

      const user = await this.userRepository.create({ name: dto.adminName, email: dto.adminEmail, passwordHash });

      const adminRoleId = await this.userRepository.findRoleIdByName('Admin');
      if (!adminRoleId) {
        throw new InternalServerErrorException('Admin role missing from newly provisioned schema');
      }
      await this.userRepository.assignRole(user.id, adminRoleId);

      return this.authService.issueTokens(user, tenantId, schemaName, companyCode);
    });
  }

  private async logProvisioningStep(
    tenantId: string,
    step: string,
    status: 'success' | 'failed',
    message?: string,
  ): Promise<void> {
    await this.kysely.pool.query(
      `INSERT INTO public.tenant_provisioning_log (tenant_id, step, status, message, finished_at)
       VALUES ($1, $2, $3, $4, now())`,
      [tenantId, step, status, message ?? null],
    );
  }
}
