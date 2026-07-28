import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { AccessService } from '../application/access.service';
import { AssignRolesDto, CreateUserDto, ResetPasswordDto, UpdateUserDto, UserResponseDto } from './dto/access.dto';
import { mapAccessError } from './access-error.util';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly accessService: AccessService) {}

  @RequirePermissions('users.view')
  @Get()
  async list(): Promise<UserResponseDto[]> {
    const users = await this.accessService.listUsers();
    return users.map((u) => new UserResponseDto(u));
  }

  @RequirePermissions('users.create')
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      return new UserResponseDto(await this.accessService.createUser(dto));
    } catch (err) {
      mapAccessError(err);
    }
  }

  @RequirePermissions('users.edit')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() current: AccessTokenPayload,
  ): Promise<UserResponseDto> {
    try {
      return new UserResponseDto(await this.accessService.updateUser(id, current.sub, dto));
    } catch (err) {
      mapAccessError(err);
    }
  }

  @RequirePermissions('users.edit')
  @Post(':id/roles')
  async setRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
    @CurrentUser() current: AccessTokenPayload,
  ): Promise<UserResponseDto> {
    try {
      return new UserResponseDto(await this.accessService.setUserRoles(id, current.sub, dto.roleIds));
    } catch (err) {
      mapAccessError(err);
    }
  }

  @RequirePermissions('users.edit')
  @Post(':id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto): Promise<void> {
    try {
      await this.accessService.resetPassword(id, dto.password);
    } catch (err) {
      mapAccessError(err);
    }
  }
}
