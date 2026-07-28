import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { SalesReturnsService } from '../application/sales-returns.service';
import { CreateSalesReturnDto } from './dto/create-sales-return.dto';
import { SalesReturnResponseDto } from './dto/sales-return-response.dto';

@ApiTags('sales')
@Controller('sales/sales-returns')
export class SalesReturnsController {
  constructor(private readonly salesReturnsService: SalesReturnsService) {}

  @RequirePermissions('sales_returns.view')
  @Get()
  async list(): Promise<SalesReturnResponseDto[]> {
    const items = await this.salesReturnsService.list();
    return items.map((i) => new SalesReturnResponseDto(i));
  }

  @RequirePermissions('sales_returns.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<SalesReturnResponseDto> {
    return new SalesReturnResponseDto(await this.salesReturnsService.getById(id));
  }

  @RequirePermissions('sales_returns.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateSalesReturnDto,
  ): Promise<SalesReturnResponseDto> {
    return new SalesReturnResponseDto(await this.salesReturnsService.create(dto, user.sub));
  }

  @RequirePermissions('sales_returns.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<SalesReturnResponseDto> {
    return new SalesReturnResponseDto(await this.salesReturnsService.approve(id, user.sub));
  }

  @RequirePermissions('sales_returns.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.salesReturnsService.delete(id);
  }
}
