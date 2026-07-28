import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  schemaName: string;
  companyCode: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenPayload {
  sub: string;
  tenantId: string;
  schemaName: string;
  companyCode: string;
  jti: string;
}

/**
 * Two independently-secreted, independently-expiring token types — signed via the same
 * JwtService but with per-call secret/expiresIn overrides so a leaked access-token secret
 * can never be used to forge a refresh token, or vice versa.
 */
@Injectable()
export class JwtTokenService {
  private readonly accessSecret: string;
  private readonly accessTtl: string;
  private readonly refreshSecret: string;
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('auth.accessTokenSecret')!;
    this.accessTtl = this.configService.get<string>('auth.accessTokenTtl')!;
    this.refreshSecret = this.configService.get<string>('auth.refreshTokenSecret')!;
    this.refreshTtlSeconds = this.configService.get<number>('auth.refreshTokenTtlSeconds')!;
  }

  get refreshTtlMs(): number {
    return this.refreshTtlSeconds * 1000;
  }

  signAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, { secret: this.accessSecret, expiresIn: this.accessTtl });
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    return this.jwtService.sign(payload, { secret: this.refreshSecret, expiresIn: this.refreshTtlSeconds });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return this.jwtService.verify<AccessTokenPayload>(token, { secret: this.accessSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
