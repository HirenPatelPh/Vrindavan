-- Registers a new tenant row and derives its schema name. This is the metadata half of
-- provisioning; the actual schema clone (tenant_template -> tenant_<code>) is performed by
-- database/scripts/provision_tenant.sh, which calls this function first. See README.md.
CREATE OR REPLACE FUNCTION public.fn_register_tenant(
  p_company_code   varchar,
  p_company_name   varchar,
  p_company_email  varchar
) RETURNS TABLE (tenant_id uuid, schema_name varchar)
LANGUAGE plpgsql
AS $$
DECLARE
  v_code   varchar := lower(regexp_replace(p_company_code, '[^a-zA-Z0-9_]', '', 'g'));
  v_schema varchar;
  v_id     uuid;
BEGIN
  IF v_code = '' THEN
    RAISE EXCEPTION 'company_code must contain at least one alphanumeric character';
  END IF;

  v_schema := 'tenant_' || v_code;

  INSERT INTO public.tenants (company_code, schema_name, company_name, company_email, status)
  VALUES (v_code, v_schema, p_company_name, p_company_email, 'provisioning')
  RETURNING id INTO v_id;

  INSERT INTO public.tenant_provisioning_log (tenant_id, step, status)
  VALUES (v_id, 'register', 'success');

  RETURN QUERY SELECT v_id, v_schema;
END;
$$;
