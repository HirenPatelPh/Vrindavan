import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { AuditService } from '../application/audit.service';
import { ListAuditLogsDto } from './dto/audit.dto';

/** Admin-only audit trail viewer (gated by `audit_logs.view`). Read-only. */
@ApiTags('audit')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @RequirePermissions('audit_logs.view')
  @Get()
  list(@Query() query: ListAuditLogsDto) {
    return this.service.list(query);
  }

  // Declared before ':id' so the literal path isn't captured by the param route.
  @RequirePermissions('audit_logs.view')
  @Get('tables')
  tables() {
    return this.service.tables();
  }

  @RequirePermissions('audit_logs.view')
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }
}
