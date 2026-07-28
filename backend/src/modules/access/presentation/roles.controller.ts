import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { AccessService } from '../application/access.service';
import {
  CreateRoleDto,
  RolePermissionsDto,
  RoleResponseDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/access.dto';
import { mapAccessError } from './access-error.util';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly accessService: AccessService) {}

  @RequirePermissions('roles.view')
  @Get()
  async list(): Promise<RoleResponseDto[]> {
    const roles = await this.accessService.listRoles();
    return roles.map((r) => new RoleResponseDto(r));
  }

  @RequirePermissions('roles.create')
  @Post()
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    return new RoleResponseDto(await this.accessService.createRole(dto.name, dto.description ?? null));
  }

  @RequirePermissions('roles.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<RoleResponseDto> {
    try {
      return new RoleResponseDto(await this.accessService.updateRole(id, dto));
    } catch (err) {
      mapAccessError(err);
    }
  }

  @RequirePermissions('roles.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.accessService.deleteRole(id);
    } catch (err) {
      mapAccessError(err);
    }
  }

  @RequirePermissions('roles.view')
  @Get(':id/permissions')
  async getPermissions(@Param('id') id: string): Promise<RolePermissionsDto> {
    try {
      return new RolePermissionsDto(await this.accessService.getRolePermissionCodes(id));
    } catch (err) {
      mapAccessError(err);
    }
  }

  @RequirePermissions('roles.edit')
  @Put(':id/permissions')
  async setPermissions(@Param('id') id: string, @Body() dto: SetRolePermissionsDto): Promise<RolePermissionsDto> {
    try {
      return new RolePermissionsDto(await this.accessService.setRolePermissions(id, dto.codes));
    } catch (err) {
      mapAccessError(err);
    }
  }
}
