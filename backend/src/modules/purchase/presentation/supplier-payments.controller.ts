import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { SupplierPaymentsService } from '../application/supplier-payments.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { SupplierPaymentResponseDto } from './dto/supplier-payment-response.dto';

@ApiTags('purchase')
@Controller('purchase/supplier-payments')
export class SupplierPaymentsController {
  constructor(private readonly supplierPaymentsService: SupplierPaymentsService) {}

  @RequirePermissions('supplier_payments.view')
  @Get()
  async list(): Promise<SupplierPaymentResponseDto[]> {
    const items = await this.supplierPaymentsService.list();
    return items.map((i) => new SupplierPaymentResponseDto(i));
  }

  @RequirePermissions('supplier_payments.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<SupplierPaymentResponseDto> {
    return new SupplierPaymentResponseDto(await this.supplierPaymentsService.getById(id));
  }

  @RequirePermissions('supplier_payments.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateSupplierPaymentDto,
  ): Promise<SupplierPaymentResponseDto> {
    return new SupplierPaymentResponseDto(await this.supplierPaymentsService.create(dto, user.sub));
  }
}
