-- Tenant directory: one row per company (customer of the SaaS). Lives in `public`.
-- Every tenant's business data lives in its own Postgres schema (schema_name below),
-- cloned from the `tenant_template` schema at provisioning time. See /database/README.md.

CREATE TABLE public.tenants (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code                varchar(30)  NOT NULL UNIQUE,   -- login key / subdomain, e.g. "acme"
  schema_name                 varchar(63)  NOT NULL UNIQUE,    -- e.g. "tenant_acme" (Postgres identifier limit = 63 bytes)
  company_name                varchar(200) NOT NULL,
  company_email               varchar(200) NOT NULL,
  company_phone               varchar(30),
  plan                        varchar(30)  NOT NULL DEFAULT 'trial'
                                CHECK (plan IN ('trial', 'starter', 'professional', 'enterprise')),
  status                      varchar(20)  NOT NULL DEFAULT 'provisioning'
                                CHECK (status IN ('provisioning', 'active', 'suspended', 'cancelled')),
  financial_year_start_month  smallint     NOT NULL DEFAULT 4 CHECK (financial_year_start_month BETWEEN 1 AND 12),
  logo_url                    text,                            -- Company Branding
  primary_color               varchar(7),                      -- Company Branding (hex)
  timezone                    varchar(60)  NOT NULL DEFAULT 'UTC',
  created_at                  timestamptz  NOT NULL DEFAULT now(),
  updated_at                  timestamptz  NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Audit trail of every provisioning attempt (schema clone + seed) for a tenant.
CREATE TABLE public.tenant_provisioning_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  step          varchar(50) NOT NULL,   -- 'register' | 'clone_schema' | 'seed_data' | 'activate'
  status        varchar(20) NOT NULL CHECK (status IN ('started', 'success', 'failed')),
  message       text,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz
);

CREATE INDEX idx_tenant_provisioning_log_tenant ON public.tenant_provisioning_log(tenant_id);
