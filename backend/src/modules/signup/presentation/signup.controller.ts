import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { TenantProvisioningService } from '../infrastructure/tenant-provisioning.service';
import { SignupDto } from './dto/signup.dto';
import { AuthResponseDto } from '../../auth/presentation/dto/auth-response.dto';

@ApiTags('signup')
@Controller('auth')
export class SignupController {
  constructor(private readonly tenantProvisioningService: TenantProvisioningService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    const result = await this.tenantProvisioningService.signup(dto);
    return new AuthResponseDto(result);
  }
}
