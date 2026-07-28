import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { AccessService } from '../application/access.service';
import { PermissionResponseDto } from './dto/access.dto';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly accessService: AccessService) {}

  // Reference list that drives the role-permission matrix (rows = modules, columns = actions).
  @RequirePermissions('roles.view')
  @Get()
  async list(): Promise<PermissionResponseDto[]> {
    const perms = await this.accessService.listPermissions();
    return perms.map((p) => new PermissionResponseDto(p));
  }
}
