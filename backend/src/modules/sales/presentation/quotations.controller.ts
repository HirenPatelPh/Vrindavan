import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { QuotationsService } from '../application/quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationResponseDto } from './dto/quotation-response.dto';
import { ConvertToSalesOrderDto } from './dto/convert-to-sales-order.dto';
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';

@ApiTags('sales')
@Controller('sales/quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @RequirePermissions('quotations.view')
  @Get()
  async list(): Promise<QuotationResponseDto[]> {
    const items = await this.quotationsService.list();
    return items.map((i) => new QuotationResponseDto(i));
  }

  @RequirePermissions('quotations.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<QuotationResponseDto> {
    return new QuotationResponseDto(await this.quotationsService.getById(id));
  }

  @RequirePermissions('quotations.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateQuotationDto,
  ): Promise<QuotationResponseDto> {
    return new QuotationResponseDto(await this.quotationsService.create(dto, user.sub));
  }

  @RequirePermissions('quotations.edit')
  @Post(':id/send')
  async send(@Param('id') id: string): Promise<QuotationResponseDto> {
    return new QuotationResponseDto(await this.quotationsService.send(id));
  }

  @RequirePermissions('quotations.edit')
  @Post(':id/accept')
  async accept(@Param('id') id: string): Promise<QuotationResponseDto> {
    return new QuotationResponseDto(await this.quotationsService.accept(id));
  }

  @RequirePermissions('quotations.edit')
  @Post(':id/reject')
  async reject(@Param('id') id: string): Promise<QuotationResponseDto> {
    return new QuotationResponseDto(await this.quotationsService.reject(id));
  }

  @RequirePermissions('sales_orders.create')
  @Post(':id/convert-to-sales-order')
  async convertToSalesOrder(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: ConvertToSalesOrderDto,
  ): Promise<SalesOrderResponseDto> {
    return new SalesOrderResponseDto(
      await this.quotationsService.convertToSalesOrder(id, dto.warehouseId, user.sub),
    );
  }

  @RequirePermissions('quotations.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.quotationsService.delete(id);
  }
}
