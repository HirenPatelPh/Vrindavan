import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/auth.controller';
import { CompanyController } from './presentation/company.controller';
import { AuthService } from './application/auth.service';
import { ProfileService } from './application/profile.service';
import { PasswordHasherService } from './infrastructure/password-hasher.service';
import { JwtTokenService } from './infrastructure/jwt-token.service';
import { USER_REPOSITORY } from './domain/user.repository.interface';
import { UserKyselyRepository } from './infrastructure/user.kysely-repository';
import { REFRESH_TOKEN_REPOSITORY } from './domain/refresh-token.repository.interface';
import { RefreshTokenKyselyRepository } from './infrastructure/refresh-token.kysely-repository';
import { OTP_REPOSITORY } from './domain/otp.repository.interface';
import { OtpKyselyRepository } from './infrastructure/otp.kysely-repository';
import { COMPANY_PROFILE_REPOSITORY } from './domain/company-profile.repository.interface';
import { CompanyProfileKyselyRepository } from './infrastructure/company-profile.kysely-repository';
import { EmailModule } from './infrastructure/email/email.module';

@Module({
  // Empty register(): JwtTokenService passes its own secret/expiresIn per call (see that file).
  imports: [JwtModule.register({}), EmailModule],
  controllers: [AuthController, CompanyController],
  providers: [
    AuthService,
    ProfileService,
    PasswordHasherService,
    JwtTokenService,
    { provide: USER_REPOSITORY, useClass: UserKyselyRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenKyselyRepository },
    { provide: OTP_REPOSITORY, useClass: OtpKyselyRepository },
    { provide: COMPANY_PROFILE_REPOSITORY, useClass: CompanyProfileKyselyRepository },
  ],
  // JwtTokenService: consumed by common/guards/jwt-auth.guard.ts (registered globally in AppModule).
  // AuthService + PasswordHasherService: consumed by modules/signup's TenantProvisioningService.
  exports: [JwtTokenService, AuthService, PasswordHasherService, USER_REPOSITORY],
})
export class AuthModule {}
