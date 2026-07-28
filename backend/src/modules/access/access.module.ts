import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ACCESS_REPOSITORY } from './domain/access.repository.interface';
import { AccessKyselyRepository } from './infrastructure/access.kysely-repository';
import { AccessService } from './application/access.service';
import { UsersController } from './presentation/users.controller';
import { RolesController } from './presentation/roles.controller';
import { PermissionsController } from './presentation/permissions.controller';

/**
 * Tenant user & role/permission administration (admin-only, gated by users.* / roles.*
 * permissions). Operates over the pre-existing RBAC tables — see pending/user-management-rbac.md.
 * Imports AuthModule for PasswordHasherService (creating users / resetting passwords).
 */
@Module({
  imports: [AuthModule],
  controllers: [UsersController, RolesController, PermissionsController],
  providers: [AccessService, { provide: ACCESS_REPOSITORY, useClass: AccessKyselyRepository }],
})
export class AccessModule {}
