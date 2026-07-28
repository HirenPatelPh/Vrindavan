import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { SalesOrdersService } from '../application/sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';

@ApiTags('sales')
@Controller('sales/sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @RequirePermissions('sales_orders.view')
  @Get()
  async list(): Promise<SalesOrderResponseDto[]> {
    const items = await this.salesOrdersService.list();
    return items.map((i) => new SalesOrderResponseDto(i));
  }

  @RequirePermissions('sales_orders.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<SalesOrderResponseDto> {
    return new SalesOrderResponseDto(await this.salesOrdersService.getById(id));
  }

  @RequirePermissions('sales_orders.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateSalesOrderDto,
  ): Promise<SalesOrderResponseDto> {
    return new SalesOrderResponseDto(await this.salesOrdersService.create(dto, user.sub));
  }

  @RequirePermissions('sales_orders.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<SalesOrderResponseDto> {
    return new SalesOrderResponseDto(await this.salesOrdersService.approve(id, user.sub));
  }

  @RequirePermissions('sales_orders.edit')
  @Post(':id/cancel')
  async cancel(@Param('id') id: string): Promise<SalesOrderResponseDto> {
    return new SalesOrderResponseDto(await this.salesOrdersService.cancel(id));
  }

  @RequirePermissions('sales_orders.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.salesOrdersService.delete(id);
  }
}
