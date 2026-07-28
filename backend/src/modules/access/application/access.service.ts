import { Inject, Injectable } from '@nestjs/common';
import { PasswordHasherService } from '../../auth/infrastructure/password-hasher.service';
import {
  ACCESS_REPOSITORY,
  IAccessRepository,
  ManagedUser,
  PermissionRow,
  RoleRow,
} from '../domain/access.repository.interface';
import {
  AccessNotFoundError,
  AdminRoleLockedError,
  DuplicateEmailError,
  LastAdminError,
  SelfModificationError,
  SystemRoleError,
} from '../domain/access.errors';

const ADMIN_ROLE = 'Admin';

@Injectable()
export class AccessService {
  constructor(
    @Inject(ACCESS_REPOSITORY) private readonly repo: IAccessRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  // ---- Users ----

  listUsers(): Promise<ManagedUser[]> {
    return this.repo.listUsers();
  }

  async createUser(input: {
    name: string;
    email: string;
    phone?: string | null;
    password: string;
    roleIds: string[];
  }): Promise<ManagedUser> {
    if (await this.repo.emailExists(input.email)) {
      throw new DuplicateEmailError(`A user with email "${input.email}" already exists.`);
    }
    if (!(await this.repo.roleIdsExist(input.roleIds))) {
      throw new AccessNotFoundError('One or more selected roles do not exist.');
    }
    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.repo.createUser({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      passwordHash,
      mustChangePassword: true, // new users must set their own password on first login
    });
    if (input.roleIds.length > 0) await this.repo.setUserRoles(user.id, input.roleIds);
    return (await this.repo.findUserById(user.id))!;
  }

  async updateUser(
    id: string,
    currentUserId: string,
    props: { name?: string; phone?: string | null; isActive?: boolean },
  ): Promise<ManagedUser> {
    const target = await this.repo.findUserById(id);
    if (!target) throw new AccessNotFoundError(`User ${id} not found.`);

    if (props.isActive === false) {
      if (id === currentUserId) throw new SelfModificationError('You cannot deactivate your own account.');
      if (target.roles.includes(ADMIN_ROLE) && (await this.repo.countActiveUsersWithRole(ADMIN_ROLE)) <= 1) {
        throw new LastAdminError('Cannot deactivate the last active Admin.');
      }
    }

    const updated = await this.repo.updateUser(id, props);
    if (!updated) throw new AccessNotFoundError(`User ${id} not found.`);
    return updated;
  }

  async setUserRoles(id: string, currentUserId: string, roleIds: string[]): Promise<ManagedUser> {
    const target = await this.repo.findUserById(id);
    if (!target) throw new AccessNotFoundError(`User ${id} not found.`);
    if (!(await this.repo.roleIdsExist(roleIds))) {
      throw new AccessNotFoundError('One or more selected roles do not exist.');
    }

    // If this user currently has Admin and the new set would remove it, protect the last admin
    // and stop an admin from stripping their own admin rights.
    const willBeAdmin = await this.roleIdsIncludeAdmin(roleIds);
    if (target.roles.includes(ADMIN_ROLE) && !willBeAdmin) {
      if (id === currentUserId) throw new SelfModificationError('You cannot remove your own Admin role.');
      if ((await this.repo.countActiveUsersWithRole(ADMIN_ROLE)) <= 1) {
        throw new LastAdminError('Cannot remove the Admin role from the last active Admin.');
      }
    }

    await this.repo.setUserRoles(id, roleIds);
    return (await this.repo.findUserById(id))!;
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const target = await this.repo.findUserById(id);
    if (!target) throw new AccessNotFoundError(`User ${id} not found.`);
    const hash = await this.passwordHasher.hash(newPassword);
    await this.repo.updateUserPassword(id, hash);
  }

  private async roleIdsIncludeAdmin(roleIds: string[]): Promise<boolean> {
    const roles = await this.repo.listRoles();
    const adminId = roles.find((r) => r.name === ADMIN_ROLE)?.id;
    return adminId != null && roleIds.includes(adminId);
  }

  // ---- Roles ----

  listRoles(): Promise<RoleRow[]> {
    return this.repo.listRoles();
  }

  createRole(name: string, description: string | null): Promise<RoleRow> {
    return this.repo.createRole(name, description);
  }

  async updateRole(id: string, props: { name?: string; description?: string | null }): Promise<RoleRow> {
    const role = await this.repo.findRoleById(id);
    if (!role) throw new AccessNotFoundError(`Role ${id} not found.`);
    if (role.isSystemRole && props.name !== undefined && props.name !== role.name) {
      throw new SystemRoleError('Built-in roles cannot be renamed.');
    }
    const updated = await this.repo.updateRole(id, props);
    if (!updated) throw new AccessNotFoundError(`Role ${id} not found.`);
    return updated;
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.repo.findRoleById(id);
    if (!role) throw new AccessNotFoundError(`Role ${id} not found.`);
    if (role.isSystemRole) throw new SystemRoleError('Built-in roles cannot be deleted.');
    await this.repo.deleteRole(id);
  }

  // ---- Permissions ----

  listPermissions(): Promise<PermissionRow[]> {
    return this.repo.listPermissions();
  }

  async getRolePermissionCodes(roleId: string): Promise<string[]> {
    const role = await this.repo.findRoleById(roleId);
    if (!role) throw new AccessNotFoundError(`Role ${roleId} not found.`);
    return this.repo.getRolePermissionCodes(roleId);
  }

  async setRolePermissions(roleId: string, codes: string[]): Promise<string[]> {
    const role = await this.repo.findRoleById(roleId);
    if (!role) throw new AccessNotFoundError(`Role ${roleId} not found.`);
    if (role.name === ADMIN_ROLE) {
      throw new AdminRoleLockedError('The Admin role always has full access and cannot be edited.');
    }
    await this.repo.setRolePermissionsByCodes(roleId, codes);
    return this.repo.getRolePermissionCodes(roleId);
  }
}
