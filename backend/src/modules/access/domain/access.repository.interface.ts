export const ACCESS_REPOSITORY = Symbol('ACCESS_REPOSITORY');

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: string[]; // role names
}

export interface RoleRow {
  id: string;
  name: string;
  isSystemRole: boolean;
  description: string | null;
  permissionCount: number;
}

export interface PermissionRow {
  id: string;
  module: string;
  action: string;
  code: string;
}

export interface CreateUserProps {
  name: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  mustChangePassword: boolean;
}

export interface UpdateUserProps {
  name?: string;
  phone?: string | null;
  isActive?: boolean;
}

/**
 * All reads/writes for tenant user & role/permission administration. One repository over the
 * pre-existing RBAC tables (users, roles, permissions, role_permissions, user_roles) — no schema
 * change; the role-based model already exists (see pending/user-management-rbac.md).
 */
export interface IAccessRepository {
  // Users
  listUsers(): Promise<ManagedUser[]>;
  findUserById(id: string): Promise<ManagedUser | null>;
  emailExists(email: string, exceptUserId?: string): Promise<boolean>;
  createUser(props: CreateUserProps): Promise<ManagedUser>;
  updateUser(id: string, props: UpdateUserProps): Promise<ManagedUser | null>;
  updateUserPassword(id: string, passwordHash: string): Promise<void>;
  /** Replace a user's role set with exactly these role ids (transactional). */
  setUserRoles(userId: string, roleIds: string[]): Promise<void>;

  // Roles
  listRoles(): Promise<RoleRow[]>;
  findRoleById(id: string): Promise<RoleRow | null>;
  createRole(name: string, description: string | null): Promise<RoleRow>;
  updateRole(id: string, props: { name?: string; description?: string | null }): Promise<RoleRow | null>;
  deleteRole(id: string): Promise<boolean>;

  // Permissions
  listPermissions(): Promise<PermissionRow[]>;
  getRolePermissionCodes(roleId: string): Promise<string[]>;
  /** Replace a role's permission set with exactly the permissions matching these codes (transactional). */
  setRolePermissionsByCodes(roleId: string, codes: string[]): Promise<void>;

  // Guardrail helpers
  /** Count of users who are active AND hold the given role name — used to protect the last Admin. */
  countActiveUsersWithRole(roleName: string): Promise<number>;
  userHasRole(userId: string, roleName: string): Promise<boolean>;
  roleIdsExist(roleIds: string[]): Promise<boolean>;
}
