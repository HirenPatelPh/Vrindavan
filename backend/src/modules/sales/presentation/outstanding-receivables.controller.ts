import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { OutstandingReceivablesService } from '../application/outstanding-receivables.service';
import { OutstandingReceivableQueryDto } from './dto/outstanding-receivable-query.dto';
import { OutstandingReceivableResponseDto } from './dto/outstanding-receivable-response.dto';

@ApiTags('sales')
@Controller('sales/outstanding-receivables')
export class OutstandingReceivablesController {
  constructor(private readonly outstandingReceivablesService: OutstandingReceivablesService) {}

  @RequirePermissions('sales_invoices.view')
  @Get()
  async list(@Query() query: OutstandingReceivableQueryDto): Promise<OutstandingReceivableResponseDto[]> {
    const rows = await this.outstandingReceivablesService.list(query);
    return rows.map((r) => new OutstandingReceivableResponseDto(r));
  }
}
