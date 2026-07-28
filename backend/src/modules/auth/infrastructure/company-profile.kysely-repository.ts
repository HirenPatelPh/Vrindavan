import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { CompanyProfile, UpdateCompanyProfileProps } from '../domain/company-profile.entity';
import { ICompanyProfileRepository } from '../domain/company-profile.repository.interface';

interface TenantRow {
  id: string;
  company_code: string;
  company_name: string;
  company_email: string;
  company_phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  timezone: string;
  plan: string;
  status: string;
}

function toDomain(row: TenantRow): CompanyProfile {
  return new CompanyProfile(
    row.id,
    row.company_code,
    row.company_name,
    row.company_email,
    row.company_phone,
    row.logo_url,
    row.primary_color,
    row.timezone,
    row.plan,
    row.status,
  );
}

/**
 * `public.tenants` lives outside every tenant schema (Phase 1), so this queries it directly
 * via the request's already-open tenant-scoped connection (its search_path fallback includes
 * `public`, and every reference here is schema-qualified anyway) rather than a repository
 * built around the tenant_template-scoped Kysely `Database` type.
 */
@Injectable()
export class CompanyProfileKyselyRepository implements ICompanyProfileRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findByTenantId(tenantId: string): Promise<CompanyProfile | null> {
    const result = await sql<TenantRow>`
      SELECT id, company_code, company_name, company_email, company_phone, logo_url,
             primary_color, timezone, plan, status
      FROM public.tenants WHERE id = ${tenantId}
    `.execute(this.tenantDb.getDb());
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }

  async update(tenantId: string, props: UpdateCompanyProfileProps): Promise<CompanyProfile | null> {
    const result = await sql<TenantRow>`
      UPDATE public.tenants SET
        company_name = COALESCE(${props.companyName ?? null}, company_name),
        company_phone = COALESCE(${props.companyPhone ?? null}, company_phone),
        logo_url = COALESCE(${props.logoUrl ?? null}, logo_url),
        primary_color = COALESCE(${props.primaryColor ?? null}, primary_color),
        timezone = COALESCE(${props.timezone ?? null}, timezone),
        updated_at = now()
      WHERE id = ${tenantId}
      RETURNING id, company_code, company_name, company_email, company_phone, logo_url,
                primary_color, timezone, plan, status
    `.execute(this.tenantDb.getDb());
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }
}
