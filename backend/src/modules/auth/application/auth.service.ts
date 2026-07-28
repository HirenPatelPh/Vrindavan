import { randomUUID } from 'crypto';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { AppClsStore } from '../../../infrastructure/database/tenant-context/tenant-cls-store';
import { EMAIL_SERVICE, IEmailService } from '../infrastructure/email/email.service.interface';
import { PasswordHasherService } from '../infrastructure/password-hasher.service';
import { JwtTokenService } from '../infrastructure/jwt-token.service';
import { User } from '../domain/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../domain/user.repository.interface';
import { IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '../domain/refresh-token.repository.interface';
import { IOtpRepository, OTP_REPOSITORY } from '../domain/otp.repository.interface';
import { generateNumericOtp } from './otp-generator';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; roles: string[]; mustChangePassword: boolean };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(OTP_REPOSITORY) private readonly otpRepository: IOtpRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly cls: ClsService<AppClsStore>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Tenant context by this point was set either by TenantContextMiddleware (header, or —
   * for /auth/refresh — a peek at the refresh token body) or, for authenticated routes, by
   * JwtAuthGuard from the verified access token. Either way this is just reading CLS, not
   * resolving anything itself.
   */
  private requireTenantContext(): { tenantId: string; schemaName: string; companyCode: string } {
    const tenantId = this.cls.get('tenantId');
    const schemaName = this.cls.get('schemaName');
    const companyCode = this.cls.get('companyCode');
    if (!tenantId || !schemaName || !companyCode) {
      throw new BadRequestException('Missing or invalid "x-company-code" header');
    }
    return { tenantId, schemaName, companyCode };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const { tenantId, schemaName, companyCode } = this.requireTenantContext();

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid email or password');

    const valid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    await this.userRepository.touchLastLogin(user.id);
    return this.issueTokens(user, tenantId, schemaName, companyCode);
  }

  async refresh(refreshTokenString: string): Promise<AuthResult> {
    const payload = this.jwtTokenService.verifyRefreshToken(refreshTokenString);

    const stored = await this.refreshTokenRepository.findActiveById(payload.jti);
    if (!stored) throw new UnauthorizedException('Refresh token has been revoked or already used');

    const matches = await this.passwordHasher.compare(refreshTokenString, stored.tokenHash);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    // Rotation: the presented token is single-use. Revoke it before issuing a new pair so a
    // replayed/stolen old token can never be exchanged again.
    await this.refreshTokenRepository.revoke(stored.id);

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException('User no longer active');

    return this.issueTokens(user, payload.tenantId, payload.schemaName, payload.companyCode);
  }

  async logout(refreshTokenString: string): Promise<void> {
    try {
      const payload = this.jwtTokenService.verifyRefreshToken(refreshTokenString);
      await this.refreshTokenRepository.revoke(payload.jti);
    } catch {
      // Already invalid/expired — logout is idempotent, nothing further to do.
    }
  }

  async forgotPassword(email: string): Promise<void> {
    this.requireTenantContext();
    const user = await this.userRepository.findByEmail(email);
    if (!user) return; // Never reveal whether the email exists.

    const code = generateNumericOtp();
    const codeHash = await this.passwordHasher.hash(code);
    const ttlSeconds = this.configService.get<number>('auth.otpTtlSeconds')!;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.otpRepository.create(user.id, 'forgot_password', codeHash, expiresAt);
    await this.emailService.sendOtpEmail(user.email, code, 'forgot_password');
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    this.requireTenantContext();
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid or expired code');

    const otp = await this.otpRepository.findLatestActive(user.id, 'forgot_password');
    if (!otp) throw new BadRequestException('Invalid or expired code');

    const matches = await this.passwordHasher.compare(code, otp.codeHash);
    if (!matches) throw new BadRequestException('Invalid or expired code');

    await this.otpRepository.markConsumed(otp.id);
    const newHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePasswordHash(user.id, newHash);
    await this.refreshTokenRepository.revokeAllForUser(user.id);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException();

    const valid = await this.passwordHasher.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePasswordHash(user.id, newHash);
    await this.refreshTokenRepository.revokeAllForUser(user.id);
  }

  /** Also used by the signup flow (Phase 3, modules/signup) to auto-login right after provisioning. */
  async issueTokens(user: User, tenantId: string, schemaName: string, companyCode: string): Promise<AuthResult> {
    const { roles, permissions } = await this.userRepository.getRolesAndPermissions(user.id);

    const accessToken = this.jwtTokenService.signAccessToken({
      sub: user.id,
      tenantId,
      schemaName,
      companyCode,
      email: user.email,
      roles,
      permissions,
    });

    const jti = randomUUID();
    const refreshToken = this.jwtTokenService.signRefreshToken({ sub: user.id, tenantId, schemaName, companyCode, jti });
    const tokenHash = await this.passwordHasher.hash(refreshToken);
    const expiresAt = new Date(Date.now() + this.jwtTokenService.refreshTtlMs);
    await this.refreshTokenRepository.create(jti, user.id, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, roles, mustChangePassword: user.mustChangePassword },
    };
  }
}
