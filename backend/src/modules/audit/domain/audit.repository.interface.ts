export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditLogFilters {
  tableName?: string;
  recordId?: string;
  action?: 'insert' | 'update' | 'delete';
  changedBy?: string;
  fromDate?: string;
  toDate?: string;
  offset: number;
  limit: number;
}

export interface AuditLogEntry {
  id: string;
  tableName: string;
  recordId: string;
  action: string;
  changedAt: string;
  changedBy: string | null;
  changedByName: string | null;
  changedByEmail: string | null;
  oldData: unknown;
  newData: unknown;
}

export interface IAuditRepository {
  findPaginated(filters: AuditLogFilters): Promise<{ items: AuditLogEntry[]; total: number }>;
  findOne(id: string): Promise<AuditLogEntry | null>;
  /** Distinct table names that actually have audit rows — powers the filter dropdown. */
  distinctTables(): Promise<string[]>;
}
