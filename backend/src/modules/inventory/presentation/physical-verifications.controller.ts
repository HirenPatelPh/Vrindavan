import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { PhysicalVerificationsService } from '../application/physical-verifications.service';
import { CreatePhysicalVerificationDto } from './dto/create-physical-verification.dto';
import { PhysicalVerificationResponseDto } from './dto/physical-verification-response.dto';

@ApiTags('inventory')
@Controller('inventory/physical-verifications')
export class PhysicalVerificationsController {
  constructor(private readonly physicalVerificationsService: PhysicalVerificationsService) {}

  @RequirePermissions('physical_verifications.view')
  @Get()
  async list(): Promise<PhysicalVerificationResponseDto[]> {
    const items = await this.physicalVerificationsService.list();
    return items.map((i) => new PhysicalVerificationResponseDto(i));
  }

  @RequirePermissions('physical_verifications.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<PhysicalVerificationResponseDto> {
    return new PhysicalVerificationResponseDto(await this.physicalVerificationsService.getById(id));
  }

  @RequirePermissions('physical_verifications.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreatePhysicalVerificationDto,
  ): Promise<PhysicalVerificationResponseDto> {
    return new PhysicalVerificationResponseDto(await this.physicalVerificationsService.create(dto, user.sub));
  }

  @RequirePermissions('physical_verifications.approve')
  @Post(':id/complete')
  async complete(@Param('id') id: string): Promise<PhysicalVerificationResponseDto> {
    return new PhysicalVerificationResponseDto(await this.physicalVerificationsService.complete(id));
  }

  @RequirePermissions('physical_verifications.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.physicalVerificationsService.remove(id);
  }
}
