import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { SalesInvoicesService } from '../application/sales-invoices.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { SalesInvoiceResponseDto } from './dto/sales-invoice-response.dto';

@ApiTags('sales')
@Controller('sales/sales-invoices')
export class SalesInvoicesController {
  constructor(private readonly salesInvoicesService: SalesInvoicesService) {}

  @RequirePermissions('sales_invoices.view')
  @Get()
  async list(): Promise<SalesInvoiceResponseDto[]> {
    const items = await this.salesInvoicesService.list();
    return items.map((i) => new SalesInvoiceResponseDto(i));
  }

  @RequirePermissions('sales_invoices.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<SalesInvoiceResponseDto> {
    return new SalesInvoiceResponseDto(await this.salesInvoicesService.getById(id));
  }

  @RequirePermissions('sales_invoices.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateSalesInvoiceDto,
  ): Promise<SalesInvoiceResponseDto> {
    return new SalesInvoiceResponseDto(await this.salesInvoicesService.create(dto, user.sub));
  }

  @RequirePermissions('sales_invoices.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<SalesInvoiceResponseDto> {
    return new SalesInvoiceResponseDto(await this.salesInvoicesService.approve(id, user.sub));
  }

  @RequirePermissions('sales_invoices.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.salesInvoicesService.delete(id);
  }
}
