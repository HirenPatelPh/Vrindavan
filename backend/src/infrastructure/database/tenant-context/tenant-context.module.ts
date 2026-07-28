import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenantDbService } from './tenant-db.service';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Global()
@Module({
  // Empty register(): every sign()/verify() call in this codebase passes its own secret +
  // expiresIn explicitly (see JwtTokenService), so no shared default config is needed here.
  imports: [JwtModule.register({})],
  providers: [TenantDbService, TenantContextMiddleware],
  // Re-exporting JwtModule (not just our own providers) is what actually makes JwtService
  // globally available — @Global() alone only globalizes a module's OWN exports, it doesn't
  // propagate through modules this one merely imports.
  exports: [TenantDbService, TenantContextMiddleware, JwtModule],
})
export class TenantContextModule {}
