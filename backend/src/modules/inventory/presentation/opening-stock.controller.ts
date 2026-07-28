import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { OpeningStockService } from '../application/opening-stock.service';
import { PostOpeningStockDto } from './dto/post-opening-stock.dto';

@ApiTags('inventory')
@Controller('inventory/products')
export class OpeningStockController {
  constructor(private readonly openingStockService: OpeningStockService) {}

  @RequirePermissions('inventory.create')
  @Post(':productId/post-opening-stock')
  @HttpCode(HttpStatus.NO_CONTENT)
  async post(
    @CurrentUser() user: AccessTokenPayload,
    @Param('productId') productId: string,
    @Body() dto: PostOpeningStockDto,
  ): Promise<void> {
    await this.openingStockService.post(productId, dto.warehouseId, user.sub);
  }
}
