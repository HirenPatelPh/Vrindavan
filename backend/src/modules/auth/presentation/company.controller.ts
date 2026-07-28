import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { AccessTokenPayload } from '../infrastructure/jwt-token.service';
import { ProfileService } from '../application/profile.service';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { CompanyProfileResponseDto } from './dto/company-profile-response.dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly profileService: ProfileService) {}

  @RequirePermissions('company_profile.view')
  @Get('profile')
  async getProfile(@CurrentUser() user: AccessTokenPayload): Promise<CompanyProfileResponseDto> {
    const company = await this.profileService.getCompanyProfile(user.tenantId);
    return new CompanyProfileResponseDto(company);
  }

  @RequirePermissions('company_profile.edit')
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfileResponseDto> {
    const company = await this.profileService.updateCompanyProfile(user.tenantId, dto);
    return new CompanyProfileResponseDto(company);
  }
}
