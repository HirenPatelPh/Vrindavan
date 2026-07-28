import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { OutstandingPayablesService } from '../application/outstanding-payables.service';
import { OutstandingPayableQueryDto } from './dto/outstanding-payable-query.dto';
import { OutstandingPayableResponseDto } from './dto/outstanding-payable-response.dto';

@ApiTags('purchase')
@Controller('purchase/outstanding-payables')
export class OutstandingPayablesController {
  constructor(private readonly outstandingPayablesService: OutstandingPayablesService) {}

  @RequirePermissions('purchase_invoices.view')
  @Get()
  async list(@Query() query: OutstandingPayableQueryDto): Promise<OutstandingPayableResponseDto[]> {
    const rows = await this.outstandingPayablesService.list(query);
    return rows.map((r) => new OutstandingPayableResponseDto(r));
  }
}
