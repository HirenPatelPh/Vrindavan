import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_REPOSITORY, AuditLogEntry, IAuditRepository } from '../domain/audit.repository.interface';
import { ListAuditLogsDto } from '../presentation/dto/audit.dto';

@Injectable()
export class AuditService {
  constructor(@Inject(AUDIT_REPOSITORY) private readonly repo: IAuditRepository) {}

  async list(q: ListAuditLogsDto): Promise<{ items: AuditLogEntry[]; total: number; page: number; limit: number }> {
    const page = q.page && q.page > 0 ? q.page : 1;
    const limit = q.limit && q.limit > 0 ? q.limit : 20;
    const { items, total } = await this.repo.findPaginated({
      tableName: q.tableName,
      recordId: q.recordId,
      action: q.action,
      changedBy: q.changedBy,
      fromDate: q.fromDate,
      toDate: q.toDate,
      offset: (page - 1) * limit,
      limit,
    });
    return { items, total, page, limit };
  }

  async getOne(id: string): Promise<AuditLogEntry> {
    const entry = await this.repo.findOne(id);
    if (!entry) throw new NotFoundException('Audit log entry not found');
    return entry;
  }

  tables(): Promise<string[]> {
    return this.repo.distinctTables();
  }
}
