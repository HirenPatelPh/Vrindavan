import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { CustomerPaymentsService } from '../application/customer-payments.service';
import { CreateCustomerPaymentDto } from './dto/create-customer-payment.dto';
import { CustomerPaymentResponseDto } from './dto/customer-payment-response.dto';

@ApiTags('sales')
@Controller('sales/customer-payments')
export class CustomerPaymentsController {
  constructor(private readonly customerPaymentsService: CustomerPaymentsService) {}

  @RequirePermissions('customer_payments.view')
  @Get()
  async list(): Promise<CustomerPaymentResponseDto[]> {
    const items = await this.customerPaymentsService.list();
    return items.map((i) => new CustomerPaymentResponseDto(i));
  }

  @RequirePermissions('customer_payments.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<CustomerPaymentResponseDto> {
    return new CustomerPaymentResponseDto(await this.customerPaymentsService.getById(id));
  }

  @RequirePermissions('customer_payments.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateCustomerPaymentDto,
  ): Promise<CustomerPaymentResponseDto> {
    return new CustomerPaymentResponseDto(await this.customerPaymentsService.create(dto, user.sub));
  }
}
