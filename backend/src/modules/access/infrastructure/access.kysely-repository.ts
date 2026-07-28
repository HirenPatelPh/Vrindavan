import { Injectable } from '@nestjs/common';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import {
  CreateUserProps,
  IAccessRepository,
  ManagedUser,
  PermissionRow,
  RoleRow,
  UpdateUserProps,
} from '../domain/access.repository.interface';

@Injectable()
export class AccessKyselyRepository implements IAccessRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private get db() {
    return this.tenantDb.getDb();
  }

  private async rolesForUser(userId: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select('roles.name')
      .where('user_roles.user_id', '=', userId)
      .orderBy('roles.name')
      .execute();
    return rows.map((r) => r.name);
  }

  private toUser(row: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    must_change_password: boolean;
    last_login_at: Date | string | null;
    created_at: Date | string;
  }, roles: string[]): ManagedUser {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      isActive: row.is_active,
      mustChangePassword: row.must_change_password,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
      createdAt: new Date(row.created_at),
      roles,
    };
  }

  async listUsers(): Promise<ManagedUser[]> {
    const rows = await this.db.selectFrom('users').selectAll().orderBy('name').execute();
    // One roles lookup per user (small tenant user counts — fine; avoids a cross-join fan-out).
    const users: ManagedUser[] = [];
    for (const row of rows) {
      users.push(this.toUser(row, await this.rolesForUser(row.id)));
    }
    return users;
  }

  async findUserById(id: string): Promise<ManagedUser | null> {
    const row = await this.db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? this.toUser(row, await this.rolesForUser(id)) : null;
  }

  async emailExists(email: string, exceptUserId?: string): Promise<boolean> {
    let q = this.db.selectFrom('users').select('id').where('email', '=', email);
    if (exceptUserId) q = q.where('id', '!=', exceptUserId);
    return (await q.executeTakeFirst()) != null;
  }

  async createUser(props: CreateUserProps): Promise<ManagedUser> {
    const row = await this.db
      .insertInto('users')
      .values({
        name: props.name,
        email: props.email,
        phone: props.phone ?? null,
        password_hash: props.passwordHash,
        must_change_password: props.mustChangePassword,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return this.toUser(row, []);
  }

  async updateUser(id: string, props: UpdateUserProps): Promise<ManagedUser | null> {
    const row = await this.db
      .updateTable('users')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.phone !== undefined ? { phone: props.phone } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? this.toUser(row, await this.rolesForUser(id)) : null;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ password_hash: passwordHash, must_change_password: true, updated_at: new Date().toISOString() })
      .where('id', '=', id)
      .execute();
  }

  async setUserRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx.deleteFrom('user_roles').where('user_id', '=', userId).execute();
      if (roleIds.length > 0) {
        await trx
          .insertInto('user_roles')
          .values(roleIds.map((role_id) => ({ user_id: userId, role_id })))
          .execute();
      }
    });
  }

  async listRoles(): Promise<RoleRow[]> {
    const rows = await this.db
      .selectFrom('roles')
      .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
      .select([
        'roles.id as id',
        'roles.name as name',
        'roles.is_system_role as is_system_role',
        'roles.description as description',
        (eb) => eb.fn.count('role_permissions.permission_id').as('permission_count'),
      ])
      .groupBy(['roles.id', 'roles.name', 'roles.is_system_role', 'roles.description'])
      .orderBy('roles.name')
      .execute();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      isSystemRole: r.is_system_role,
      description: r.description,
      permissionCount: Number(r.permission_count),
    }));
  }

  async findRoleById(id: string): Promise<RoleRow | null> {
    const row = await this.db.selectFrom('roles').selectAll().where('id', '=', id).executeTakeFirst();
    if (!row) return null;
    const count = await this.db
      .selectFrom('role_permissions')
      .select((eb) => eb.fn.count('permission_id').as('c'))
      .where('role_id', '=', id)
      .executeTakeFirstOrThrow();
    return {
      id: row.id,
      name: row.name,
      isSystemRole: row.is_system_role,
      description: row.description,
      permissionCount: Number(count.c),
    };
  }

  async createRole(name: string, description: string | null): Promise<RoleRow> {
    const row = await this.db
      .insertInto('roles')
      .values({ name, description, is_system_role: false })
      .returningAll()
      .executeTakeFirstOrThrow();
    return { id: row.id, name: row.name, isSystemRole: row.is_system_role, description: row.description, permissionCount: 0 };
  }

  async updateRole(id: string, props: { name?: string; description?: string | null }): Promise<RoleRow | null> {
    await this.db
      .updateTable('roles')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.description !== undefined ? { description: props.description } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .execute();
    return this.findRoleById(id);
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await this.db.deleteFrom('roles').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }

  async listPermissions(): Promise<PermissionRow[]> {
    const rows = await this.db.selectFrom('permissions').selectAll().orderBy(['module', 'action']).execute();
    return rows.map((r) => ({ id: r.id, module: r.module, action: r.action, code: r.code }));
  }

  async getRolePermissionCodes(roleId: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom('role_permissions')
      .innerJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
      .select('permissions.code')
      .where('role_permissions.role_id', '=', roleId)
      .execute();
    return rows.map((r) => r.code);
  }

  async setRolePermissionsByCodes(roleId: string, codes: string[]): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx.deleteFrom('role_permissions').where('role_id', '=', roleId).execute();
      if (codes.length === 0) return;
      const perms = await trx.selectFrom('permissions').select('id').where('code', 'in', codes).execute();
      if (perms.length > 0) {
        await trx
          .insertInto('role_permissions')
          .values(perms.map((p) => ({ role_id: roleId, permission_id: p.id })))
          .execute();
      }
    });
  }

  async countActiveUsersWithRole(roleName: string): Promise<number> {
    const row = await this.db
      .selectFrom('user_roles')
      .innerJoin('users', 'users.id', 'user_roles.user_id')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select((eb) => eb.fn.count('users.id').distinct().as('c'))
      .where('roles.name', '=', roleName)
      .where('users.is_active', '=', true)
      .executeTakeFirstOrThrow();
    return Number(row.c);
  }

  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    const row = await this.db
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select('roles.id')
      .where('user_roles.user_id', '=', userId)
      .where('roles.name', '=', roleName)
      .executeTakeFirst();
    return row != null;
  }

  async roleIdsExist(roleIds: string[]): Promise<boolean> {
    if (roleIds.length === 0) return true;
    const rows = await this.db.selectFrom('roles').select('id').where('id', 'in', roleIds).execute();
    return rows.length === roleIds.length;
  }
}
