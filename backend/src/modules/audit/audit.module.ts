import { Module } from '@nestjs/common';
import { AUDIT_REPOSITORY } from './domain/audit.repository.interface';
import { AuditKyselyRepository } from './infrastructure/audit.kysely-repository';
import { AuditService } from './application/audit.service';
import { AuditController } from './presentation/audit.controller';

/** Read-only audit-trail viewing (who changed which record, and the before/after). Admin-only. */
@Module({
  controllers: [AuditController],
  providers: [AuditService, { provide: AUDIT_REPOSITORY, useClass: AuditKyselyRepository }],
})
export class AuditModule {}
