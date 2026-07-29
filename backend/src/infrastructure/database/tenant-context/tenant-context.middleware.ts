import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { sql } from 'kysely';
import { KyselyService } from '../kysely/kysely.service';
import { AppClsStore, SCHEMA_NAME_PATTERN } from './tenant-cls-store';

// Subdomain labels that never map to a tenant (infra/marketing hosts under the base domain).
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'app', 'admin', 'mail', 'ftp', 'static', 'assets']);

interface TenantRow {
  id: string;
  company_code: string;
  schema_name: string;
}

interface RefreshTokenPeek {
  tenantId?: string;
  schemaName?: string;
  companyCode?: string;
}

/**
 * Resolves tenant context (best-effort — never hard-fails here) via, in order:
 *  1. `x-company-code` header -> public.tenants lookup (used by login/forgot-password/
 *     reset-password, and still works for any other request that sends it).
 *  2. A `refreshToken` in the request body -> its own (already-signed, verified here) claims
 *     (used by POST /auth/refresh, which intentionally requires no header).
 *  3. Neither present -> leaves CLS unset. `JwtAuthGuard` (Phase 3) is what sets tenant
 *     context for authenticated routes, from the verified *access* token — it runs after this
 *     middleware and overwrites whatever (if anything) is set here, since the token is
 *     cryptographically authoritative. Routes needing a tenant but getting neither (e.g. an
 *     unauthenticated call to login with no header) fail downstream in the service layer
 *     (AuthService.requireTenantContext()), not here — this middleware only resolves, it
 *     doesn't decide which routes require a tenant.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService<AppClsStore>,
    private readonly kysely: KyselyService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const companyCode = req.header('x-company-code');
      if (companyCode) {
        await this.resolveFromHeader(companyCode);
      } else {
        // No explicit header — try the request's subdomain (e.g. vrindavan.enrix.in), then a
        // refresh token. Both are best-effort here (no hard fail); JwtAuthGuard is authoritative
        // for authenticated routes and overwrites this from the verified access token.
        const sub = this.subdomainCompanyCode(req);
        const resolved = sub ? await this.lookupAndSet(sub) : false;
        if (!resolved && typeof req.body?.refreshToken === 'string') {
          this.resolveFromRefreshToken(req.body.refreshToken);
        }
      }
      next();
    } catch (err) {
      // Express middleware doesn't auto-catch rejected promises — forward explicitly so
      // Nest's exception filters still handle it instead of the process crashing.
      next(err);
    }
  }

  private async resolveFromHeader(rawCompanyCode: string): Promise<void> {
    const ok = await this.lookupAndSet(rawCompanyCode);
    if (!ok) {
      throw new NotFoundException(`No active company found for code "${rawCompanyCode.toLowerCase().trim()}"`);
    }
  }

  /**
   * Looks up an active tenant by company code and sets it in CLS if found. Returns whether it
   * resolved. Normalizes to match how signup stores the code (`.toLowerCase().trim()`), so a
   * differently-cased code (e.g. "Vrindavan" vs stored "vrindavan") still resolves. Callers that
   * must fail loudly (the explicit header path) throw on false; the best-effort subdomain path
   * ignores it.
   */
  private async lookupAndSet(rawCompanyCode: string): Promise<boolean> {
    const companyCode = rawCompanyCode.toLowerCase().trim();
    const result = await sql<TenantRow>`
      SELECT id, company_code, schema_name FROM public.tenants
      WHERE company_code = ${companyCode} AND status = 'active'
    `.execute(this.kysely.db);

    const tenant = result.rows[0];
    if (!tenant || !SCHEMA_NAME_PATTERN.test(tenant.schema_name)) return false;

    this.cls.set('tenantId', tenant.id);
    this.cls.set('schemaName', tenant.schema_name);
    this.cls.set('companyCode', tenant.company_code);
    return true;
  }

  /**
   * Extracts the tenant's company code from the request subdomain when BASE_DOMAIN is configured:
   * "vrindavan.enrix.in" -> "vrindavan". Returns null for the bare base domain, reserved labels,
   * or when subdomain resolution is disabled (empty BASE_DOMAIN, e.g. local dev).
   */
  private subdomainCompanyCode(req: Request): string | null {
    const baseDomain = (this.configService.get<string>('baseDomain') ?? '').toLowerCase();
    if (!baseDomain) return null;
    const host = (req.headers.host ?? '').toLowerCase().split(':')[0].trim();
    if (!host || host === baseDomain || !host.endsWith('.' + baseDomain)) return null;
    const label = host.slice(0, host.length - baseDomain.length - 1).split('.')[0];
    if (!label || RESERVED_SUBDOMAINS.has(label)) return null;
    return label;
  }

  /**
   * A lightweight peek at the refresh token's claims purely to resolve which schema to query —
   * NOT the authoritative validity check (AuthService.refresh() still verifies the signature
   * again and checks the DB for revocation). If this fails for any reason, we simply leave
   * CLS unset and let AuthService's own verifyRefreshToken() call raise the real error.
   */
  private resolveFromRefreshToken(token: string): void {
    try {
      const payload = this.jwtService.verify<RefreshTokenPeek>(token, {
        secret: this.configService.get<string>('auth.refreshTokenSecret'),
      });
      if (payload.schemaName && SCHEMA_NAME_PATTERN.test(payload.schemaName)) {
        this.cls.set('tenantId', payload.tenantId);
        this.cls.set('schemaName', payload.schemaName);
        this.cls.set('companyCode', payload.companyCode);
      }
    } catch {
      // Swallowed deliberately — see doc comment above.
    }
  }
}
