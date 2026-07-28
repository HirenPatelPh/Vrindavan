import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

/**
 * Global guard (registered via APP_GUARD, after JwtAuthGuard — see app.module.ts). Reads
 * `request.user.permissions` (set by JwtAuthGuard from the access token) and checks it against
 * the codes declared via @RequirePermissions() on the route. Routes with no such metadata
 * (including every @Public() route, which never reaches here with a request.user anyway) pass
 * through unchecked.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const granted = request.user?.permissions ?? [];
    const missing = required.filter((code) => !granted.includes(code));
    if (missing.length > 0) {
      throw new ForbiddenException(`Missing required permission(s): ${missing.join(', ')}`);
    }
    return true;
  }
}
