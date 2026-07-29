import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { AuditLogEntry, AuditLogFilters, IAuditRepository } from '../domain/audit.repository.interface';

@Injectable()
export class AuditKyselyRepository implements IAuditRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private get db() {
    return this.tenantDb.getDb();
  }

  private applyFilters<T>(q: T, f: AuditLogFilters): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = q;
    if (f.tableName) query = query.where('a.table_name', '=', f.tableName);
    if (f.recordId) query = query.where('a.record_id', '=', f.recordId);
    if (f.action) query = query.where('a.action', '=', f.action);
    if (f.changedBy) query = query.where('a.changed_by', '=', f.changedBy);
    if (f.fromDate) query = query.where('a.changed_at', '>=', sql`${f.fromDate}::date`);
    // Inclusive end date: everything strictly before the day after toDate.
    if (f.toDate) query = query.where('a.changed_at', '<', sql`(${f.toDate}::date + interval '1 day')`);
    return query as T;
  }

  async findPaginated(f: AuditLogFilters): Promise<{ items: AuditLogEntry[]; total: number }> {
    const rows = await this.applyFilters(
      this.db
        .selectFrom('audit_logs as a')
        .leftJoin('users as u', 'u.id', 'a.changed_by')
        .select([
          'a.id',
          'a.table_name',
          'a.record_id',
          'a.action',
          'a.changed_at',
          'a.changed_by',
          'a.old_data',
          'a.new_data',
          'u.name as changed_by_name',
          'u.email as changed_by_email',
        ]),
      f,
    )
      .orderBy('a.changed_at', 'desc')
      .limit(f.limit)
      .offset(f.offset)
      .execute();

    const countRow = await this.applyFilters(
      this.db.selectFrom('audit_logs as a').select(({ fn }) => fn.countAll<number>().as('count')),
      f,
    ).executeTakeFirst();

    return { items: rows.map((r) => this.map(r)), total: Number(countRow?.count ?? 0) };
  }

  async findOne(id: string): Promise<AuditLogEntry | null> {
    const row = await this.db
      .selectFrom('audit_logs as a')
      .leftJoin('users as u', 'u.id', 'a.changed_by')
      .select([
        'a.id',
        'a.table_name',
        'a.record_id',
        'a.action',
        'a.changed_at',
        'a.changed_by',
        'a.old_data',
        'a.new_data',
        'u.name as changed_by_name',
        'u.email as changed_by_email',
      ])
      .where('a.id', '=', id)
      .executeTakeFirst();
    return row ? this.map(row) : null;
  }

  async distinctTables(): Promise<string[]> {
    const rows = await this.db
      .selectFrom('audit_logs')
      .select('table_name')
      .distinct()
      .orderBy('table_name')
      .execute();
    return rows.map((r) => r.table_name);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map(r: any): AuditLogEntry {
    return {
      id: r.id,
      tableName: r.table_name,
      recordId: r.record_id,
      action: r.action,
      changedAt: r.changed_at instanceof Date ? r.changed_at.toISOString() : String(r.changed_at),
      changedBy: r.changed_by ?? null,
      changedByName: r.changed_by_name ?? null,
      changedByEmail: r.changed_by_email ?? null,
      oldData: r.old_data ?? null,
      newData: r.new_data ?? null,
    };
  }
}
