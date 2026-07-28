import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsOptional, IsString, IsUUID, Length, MinLength } from 'class-validator';
import { ManagedUser, PermissionRow, RoleRow } from '../../domain/access.repository.interface';

// ---- Users ----

export class CreateUserDto {
  @ApiProperty() @IsString() @Length(1, 150) name!: string;
  @ApiProperty() @IsEmail() @Length(1, 200) email!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 30) phone?: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('all', { each: true }) roleIds!: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 150) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class AssignRolesDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('all', { each: true }) roleIds!: string[];
}

export class ResetPasswordDto {
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
}

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true }) phone: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() mustChangePassword: boolean;
  @ApiProperty({ nullable: true }) lastLoginAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: [String] }) roles: string[];

  constructor(u: ManagedUser) {
    this.id = u.id;
    this.name = u.name;
    this.email = u.email;
    this.phone = u.phone;
    this.isActive = u.isActive;
    this.mustChangePassword = u.mustChangePassword;
    this.lastLoginAt = u.lastLoginAt;
    this.createdAt = u.createdAt;
    this.roles = u.roles;
  }
}

// ---- Roles ----

export class CreateRoleDto {
  @ApiProperty() @IsString() @Length(1, 50) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 50) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class SetRolePermissionsDto {
  @ApiProperty({ type: [String], description: 'Permission codes (module.action) to grant this role.' })
  @IsArray()
  @IsString({ each: true })
  codes!: string[];
}

export class RoleResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() isSystemRole: boolean;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() permissionCount: number;

  constructor(r: RoleRow) {
    this.id = r.id;
    this.name = r.name;
    this.isSystemRole = r.isSystemRole;
    this.description = r.description;
    this.permissionCount = r.permissionCount;
  }
}

// ---- Permissions ----

export class PermissionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() module: string;
  @ApiProperty() action: string;
  @ApiProperty() code: string;

  constructor(p: PermissionRow) {
    this.id = p.id;
    this.module = p.module;
    this.action = p.action;
    this.code = p.code;
  }
}

// Reusable list-of-codes wrapper (for GET/PUT /roles/:id/permissions).
export class RolePermissionsDto {
  @ApiProperty({ type: [String] }) codes: string[];
  constructor(codes: string[]) {
    this.codes = codes;
  }
}
