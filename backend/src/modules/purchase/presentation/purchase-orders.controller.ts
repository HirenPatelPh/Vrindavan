import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { PurchaseOrdersService } from '../application/purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrderResponseDto } from './dto/purchase-order-response.dto';

@ApiTags('purchase')
@Controller('purchase/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @RequirePermissions('purchase_orders.view')
  @Get()
  async list(): Promise<PurchaseOrderResponseDto[]> {
    const items = await this.purchaseOrdersService.list();
    return items.map((i) => new PurchaseOrderResponseDto(i));
  }

  @RequirePermissions('purchase_orders.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<PurchaseOrderResponseDto> {
    return new PurchaseOrderResponseDto(await this.purchaseOrdersService.getById(id));
  }

  @RequirePermissions('purchase_orders.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrderResponseDto> {
    return new PurchaseOrderResponseDto(await this.purchaseOrdersService.create(dto, user.sub));
  }

  @RequirePermissions('purchase_orders.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<PurchaseOrderResponseDto> {
    return new PurchaseOrderResponseDto(await this.purchaseOrdersService.approve(id, user.sub));
  }

  @RequirePermissions('purchase_orders.edit')
  @Post(':id/cancel')
  async cancel(@Param('id') id: string): Promise<PurchaseOrderResponseDto> {
    return new PurchaseOrderResponseDto(await this.purchaseOrdersService.cancel(id));
  }

  @RequirePermissions('purchase_orders.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.purchaseOrdersService.delete(id);
  }
}
