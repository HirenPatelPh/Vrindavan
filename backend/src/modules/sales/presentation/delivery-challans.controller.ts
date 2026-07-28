import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { DeliveryChallansService } from '../application/delivery-challans.service';
import { CreateDeliveryChallanDto } from './dto/create-delivery-challan.dto';
import { DeliveryChallanResponseDto } from './dto/delivery-challan-response.dto';

@ApiTags('sales')
@Controller('sales/delivery-challans')
export class DeliveryChallansController {
  constructor(private readonly deliveryChallansService: DeliveryChallansService) {}

  @RequirePermissions('delivery_challans.view')
  @Get()
  async list(): Promise<DeliveryChallanResponseDto[]> {
    const items = await this.deliveryChallansService.list();
    return items.map((i) => new DeliveryChallanResponseDto(i));
  }

  @RequirePermissions('delivery_challans.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<DeliveryChallanResponseDto> {
    return new DeliveryChallanResponseDto(await this.deliveryChallansService.getById(id));
  }

  @RequirePermissions('delivery_challans.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateDeliveryChallanDto,
  ): Promise<DeliveryChallanResponseDto> {
    return new DeliveryChallanResponseDto(await this.deliveryChallansService.create(dto, user.sub));
  }

  @RequirePermissions('delivery_challans.approve')
  @Post(':id/deliver')
  async deliver(@Param('id') id: string): Promise<DeliveryChallanResponseDto> {
    return new DeliveryChallanResponseDto(await this.deliveryChallansService.deliver(id));
  }

  @RequirePermissions('delivery_challans.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deliveryChallansService.delete(id);
  }
}
