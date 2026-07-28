import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Users } from '../../../infrastructure/database/kysely/db.types';
import { User } from '../domain/user.entity';
import {
  CreateUserProps,
  IUserRepository,
  UserRolesAndPermissions,
} from '../domain/user.repository.interface';

type UserRow = Selectable<Users>;

function toDomain(row: UserRow): User {
  return new User(
    row.id,
    row.name,
    row.email,
    row.phone,
    row.password_hash,
    row.is_active,
    row.must_change_password,
    row.created_at,
    row.updated_at,
  );
}

@Injectable()
export class UserKyselyRepository implements IUserRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.tenantDb.getDb().selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.tenantDb.getDb().selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateUserProps): Promise<User> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('users')
      .values({ name: props.name, email: props.email, password_hash: props.passwordHash })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.tenantDb
      .getDb()
      .updateTable('users')
      .set({ password_hash: passwordHash, must_change_password: false, updated_at: new Date().toISOString() })
      .where('id', '=', id)
      .execute();
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.tenantDb
      .getDb()
      .updateTable('users')
      .set({ last_login_at: new Date().toISOString() })
      .where('id', '=', id)
      .execute();
  }

  async updateProfile(id: string, props: Partial<Pick<User, 'name' | 'phone'>>): Promise<User | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('users')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.phone !== undefined ? { phone: props.phone } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async getRolesAndPermissions(userId: string): Promise<UserRolesAndPermissions> {
    const roleRows = await this.tenantDb
      .getDb()
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select('roles.name')
      .where('user_roles.user_id', '=', userId)
      .execute();

    const permissionRows = await this.tenantDb
      .getDb()
      .selectFrom('user_roles')
      .innerJoin('role_permissions', 'role_permissions.role_id', 'user_roles.role_id')
      .innerJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
      .select('permissions.code')
      .distinct()
      .where('user_roles.user_id', '=', userId)
      .execute();

    return {
      roles: roleRows.map((r) => r.name),
      permissions: permissionRows.map((p) => p.code),
    };
  }

  async findRoleIdByName(name: string): Promise<string | null> {
    const row = await this.tenantDb.getDb().selectFrom('roles').select('id').where('name', '=', name).executeTakeFirst();
    return row?.id ?? null;
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.tenantDb
      .getDb()
      .insertInto('user_roles')
      .values({ user_id: userId, role_id: roleId })
      .onConflict((oc) => oc.doNothing())
      .execute();
  }
}
