import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { sql } from 'kysely';
import { firstValueFrom, from, Observable } from 'rxjs';
import { KyselyService } from '../../infrastructure/database/kysely/kysely.service';
import { AppClsStore, SCHEMA_NAME_PATTERN, pgQuoteIdent } from '../../infrastructure/database/tenant-context/tenant-cls-store';

/**
 * Opens exactly one physical Postgres connection for the lifetime of a request, sets its
 * `search_path` to the resolved tenant schema, and stores that scoped Kysely instance in CLS
 * (read via TenantDbService.getDb()). The connection is released back to the pool the instant
 * `next.handle()` settles — never held across requests, never shared between concurrent
 * requests for different tenants.
 *
 * Routes with no resolved tenant (e.g. /health, anything TenantContextMiddleware skipped) pass
 * through untouched on the shared pool.
 */
@Injectable()
export class TenantConnectionInterceptor implements NestInterceptor {
  constructor(
    private readonly kysely: KyselyService,
    private readonly cls: ClsService<AppClsStore>,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const schemaName = this.cls.get('schemaName');
    if (!schemaName) {
      return next.handle();
    }
    if (!SCHEMA_NAME_PATTERN.test(schemaName)) {
      throw new BadRequestException('Invalid tenant schema resolved for this request');
    }

    return from(
      this.kysely.db.connection().execute(async (scopedDb) => {
        await sql.raw(`SET search_path TO ${pgQuoteIdent(schemaName)}, public`).execute(scopedDb);
        // Stamp the acting user onto this connection so the audit trigger (trg_audit_log) records
        // WHO changed each row. Session-scoped and re-applied every request, so a pooled connection
        // never carries a previous user; an empty string (unauthenticated) → trigger records NULL.
        const userId = this.cls.get('userId') ?? '';
        await sql`SELECT set_config('app.current_user_id', ${userId}, false)`.execute(scopedDb);
        this.cls.set('tenantDb', scopedDb);
        return firstValueFrom(next.handle(), { defaultValue: undefined });
      }),
    );
  }
}
