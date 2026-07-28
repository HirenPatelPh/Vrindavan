import { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserProps {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserRolesAndPermissions {
  roles: string[];
  permissions: string[];
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(props: CreateUserProps): Promise<User>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  updateProfile(id: string, props: Partial<Pick<User, 'name' | 'phone'>>): Promise<User | null>;
  touchLastLogin(id: string): Promise<void>;
  /** Resolves distinct role names + distinct permission.code values for a user, via user_roles -> role_permissions -> permissions. */
  getRolesAndPermissions(userId: string): Promise<UserRolesAndPermissions>;
  /** Looks up a role's id by name (e.g. 'Admin') — used by signup to grant the first user Admin. */
  findRoleIdByName(name: string): Promise<string | null>;
  assignRole(userId: string, roleId: string): Promise<void>;
}
