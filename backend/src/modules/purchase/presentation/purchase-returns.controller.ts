import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { PurchaseReturnsService } from '../application/purchase-returns.service';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { PurchaseReturnResponseDto } from './dto/purchase-return-response.dto';

@ApiTags('purchase')
@Controller('purchase/purchase-returns')
export class PurchaseReturnsController {
  constructor(private readonly purchaseReturnsService: PurchaseReturnsService) {}

  @RequirePermissions('purchase_returns.view')
  @Get()
  async list(): Promise<PurchaseReturnResponseDto[]> {
    const items = await this.purchaseReturnsService.list();
    return items.map((i) => new PurchaseReturnResponseDto(i));
  }

  @RequirePermissions('purchase_returns.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<PurchaseReturnResponseDto> {
    return new PurchaseReturnResponseDto(await this.purchaseReturnsService.getById(id));
  }

  @RequirePermissions('purchase_returns.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreatePurchaseReturnDto,
  ): Promise<PurchaseReturnResponseDto> {
    return new PurchaseReturnResponseDto(await this.purchaseReturnsService.create(dto, user.sub));
  }

  @RequirePermissions('purchase_returns.approve')
  @Post(':id/approve')
  async approve(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<PurchaseReturnResponseDto> {
    return new PurchaseReturnResponseDto(await this.purchaseReturnsService.approve(id, user.sub));
  }

  @RequirePermissions('purchase_returns.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.purchaseReturnsService.delete(id);
  }
}
