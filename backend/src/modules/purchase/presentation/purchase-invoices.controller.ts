import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { PurchaseInvoicesService } from '../application/purchase-invoices.service';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';
import { PurchaseInvoiceResponseDto } from './dto/purchase-invoice-response.dto';

@ApiTags('purchase')
@Controller('purchase/purchase-invoices')
export class PurchaseInvoicesController {
  constructor(private readonly purchaseInvoicesService: PurchaseInvoicesService) {}

  @RequirePermissions('purchase_invoices.view')
  @Get()
  async list(): Promise<PurchaseInvoiceResponseDto[]> {
    const items = await this.purchaseInvoicesService.list();
    return items.map((i) => new PurchaseInvoiceResponseDto(i));
  }

  @RequirePermissions('purchase_invoices.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<PurchaseInvoiceResponseDto> {
    return new PurchaseInvoiceResponseDto(await this.purchaseInvoicesService.getById(id));
  }

  @RequirePermissions('purchase_invoices.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoiceResponseDto> {
    return new PurchaseInvoiceResponseDto(await this.purchaseInvoicesService.create(dto, user.sub));
  }

  @RequirePermissions('purchase_invoices.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<PurchaseInvoiceResponseDto> {
    return new PurchaseInvoiceResponseDto(await this.purchaseInvoicesService.approve(id, user.sub));
  }

  @RequirePermissions('purchase_invoices.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.purchaseInvoicesService.delete(id);
  }
}
