import { ClsStore } from 'nestjs-cls';
import { Kysely } from 'kysely';
import { DB } from '../kysely/db.types';

// Schema names are derived by public.fn_register_tenant() as `tenant_` + sanitized code
// (see /database/migrations/public/004_register_tenant_function.sql). Re-validated here as
// defense in depth before it's ever interpolated into a `SET search_path` statement.
export const SCHEMA_NAME_PATTERN = /^tenant_[a-z0-9_]+$/;

export interface AppClsStore extends ClsStore {
  tenantId?: string;
  schemaName?: string;
  companyCode?: string;
  /** Authenticated user id (JWT `sub`) — stamped onto the DB session so the audit trigger records who changed each row. */
  userId?: string;
  /** The single physical connection opened for this request, scoped via KyselyService.db.connection(). */
  tenantDb?: Kysely<DB>;
}

export function pgQuoteIdent(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"';
}
