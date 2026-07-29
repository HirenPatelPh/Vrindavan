import { Controller, Get, NotFoundException, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { sql } from 'kysely';
import { Public } from '../../common/decorators/public.decorator';
import { KyselyService } from '../../infrastructure/database/kysely/kysely.service';

// Subdomain labels that never map to a tenant (kept in sync with TenantContextMiddleware).
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'app', 'admin', 'mail', 'ftp', 'static', 'assets']);

interface BrandingRow {
  company_code: string;
  company_name: string;
  logo_url: string | null;
  primary_color: string | null;
}

/**
 * Public, unauthenticated endpoints that resolve a company from the request host — used by the
 * branded login screen (which company owns this subdomain?) and by Caddy's on-demand-TLS gate.
 */
@ApiTags('tenant')
@Controller()
export class TenantInfoController {
  constructor(
    private readonly config: ConfigService,
    private readonly kysely: KyselyService,
  ) {}

  /** Login-screen branding: given the host (e.g. vrindavan.enrix.in), return the company name/logo. */
  @Public()
  @Get('tenant-info')
  async tenantInfo(@Req() req: Request, @Query('host') hostQuery?: string): Promise<{
    companyCode: string;
    companyName: string;
    logoUrl: string | null;
    primaryColor: string | null;
  }> {
    const code = this.codeFromHost(hostQuery ?? req.headers.host ?? '');
    const row = code ? await this.lookup(code) : null;
    if (!row) throw new NotFoundException('No active company for this host.');
    return {
      companyCode: row.company_code,
      companyName: row.company_name,
      logoUrl: row.logo_url,
      primaryColor: row.primary_color,
    };
  }

  /**
   * Caddy on-demand-TLS "ask" gate: Caddy calls this before issuing a cert for a hostname. Reply
   * 200 only if the host maps to an active tenant, so certs are never minted for random domains.
   */
  @Public()
  @Get('tls-check')
  async tlsCheck(@Query('domain') domain: string | undefined, @Res() res: Response): Promise<void> {
    const code = this.codeFromHost(domain ?? '');
    const row = code ? await this.lookup(code) : null;
    res.status(row ? 200 : 403).send(row ? 'ok' : 'denied');
  }

  /** "vrindavan.enrix.in" -> "vrindavan"; null for the bare base domain, reserved labels, or when disabled. */
  private codeFromHost(rawHost: string): string | null {
    const baseDomain = (this.config.get<string>('baseDomain') ?? '').toLowerCase();
    if (!baseDomain) return null;
    const host = rawHost.toLowerCase().split(':')[0].trim();
    if (!host || host === baseDomain || !host.endsWith('.' + baseDomain)) return null;
    const label = host.slice(0, host.length - baseDomain.length - 1).split('.')[0];
    if (!label || RESERVED_SUBDOMAINS.has(label)) return null;
    return label;
  }

  private async lookup(rawCode: string): Promise<BrandingRow | null> {
    const code = rawCode.toLowerCase().trim();
    const result = await sql<BrandingRow>`
      SELECT company_code, company_name, logo_url, primary_color
      FROM public.tenants
      WHERE company_code = ${code} AND status = 'active'
    `.execute(this.kysely.db);
    return result.rows[0] ?? null;
  }
}
