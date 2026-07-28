-- Seeds the current financial year for a newly provisioned tenant schema, based on the
-- fiscal start month recorded on public.tenants.financial_year_start_month (default 4 = April,
-- the Indian FY convention matching the GST/HSN fields used elsewhere in this schema). Run via:
--   psql "$DATABASE_URL" -v schema=tenant_acme -f seed/003_financial_year.sql
\if :{?schema}
\else
  \set schema tenant_template
\endif
SET search_path TO :"schema";

DO $$
DECLARE
  v_start_month int := 4;   -- overridden below if a matching public.tenants row exists
  v_today date := current_date;
  v_fy_start date;
  v_fy_end date;
  v_fy_name text;
BEGIN
  BEGIN
    SELECT financial_year_start_month INTO v_start_month
    FROM public.tenants WHERE schema_name = current_schema()
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_start_month := 4;
  END;
  v_start_month := COALESCE(v_start_month, 4);

  IF EXTRACT(MONTH FROM v_today) >= v_start_month THEN
    v_fy_start := make_date(EXTRACT(YEAR FROM v_today)::int, v_start_month, 1);
  ELSE
    v_fy_start := make_date(EXTRACT(YEAR FROM v_today)::int - 1, v_start_month, 1);
  END IF;
  v_fy_end := v_fy_start + INTERVAL '1 year' - INTERVAL '1 day';
  v_fy_name := 'FY' || to_char(v_fy_start, 'YY') || '-' || to_char(v_fy_end, 'YY');

  INSERT INTO financial_years (name, start_date, end_date, is_current, is_closed)
  VALUES (v_fy_name, v_fy_start, v_fy_end, true, false)
  ON CONFLICT DO NOTHING;
END;
$$;
