import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppClsStore } from '../../infrastructure/database/tenant-context/tenant-cls-store';
import { JwtTokenService } from '../../modules/auth/infrastructure/jwt-token.service';

/**
 * Global guard (registered via APP_GUARD in app.module.ts). Skips routes marked @Public().
 * For everything else: verifies the access token and sets BOTH `request.user` (read via
 * @CurrentUser()) AND the CLS tenant keys — from the token's claims, which are
 * cryptographically authoritative and overwrite whatever TenantContextMiddleware set from a
 * header. This is the "Phase 3 replaces the resolution source" change promised in Phase 2.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtTokenService: JwtTokenService,
    private readonly cls: ClsService<AppClsStore>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = this.jwtTokenService.verifyAccessToken(token);

    request.user = payload;
    this.cls.set('tenantId', payload.tenantId);
    this.cls.set('schemaName', payload.schemaName);
    this.cls.set('companyCode', payload.companyCode);
    this.cls.set('userId', payload.sub);

    return true;
  }
}
