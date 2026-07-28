-- Sequential, financial-year-scoped document numbers: PO-2025-00001, INV-2025-00042, ...
-- The INSERT ... ON CONFLICT DO UPDATE is a single atomic statement, so concurrent callers
-- never receive the same number (Postgres row-locks the conflicting row for the duration).
SET search_path TO tenant_template, public;

CREATE OR REPLACE FUNCTION tenant_template.fn_next_document_number(
  p_document_type     varchar,
  p_financial_year_id uuid,
  p_prefix             varchar
) RETURNS varchar
LANGUAGE plpgsql
AS $$
DECLARE
  v_next    integer;
  v_fy_name varchar;
BEGIN
  INSERT INTO tenant_template.document_number_sequences (financial_year_id, document_type, prefix, last_number)
  VALUES (p_financial_year_id, p_document_type, p_prefix, 1)
  ON CONFLICT (financial_year_id, document_type)
  DO UPDATE SET last_number = tenant_template.document_number_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  SELECT name INTO v_fy_name FROM tenant_template.financial_years WHERE id = p_financial_year_id;

  RETURN p_prefix || '-' || COALESCE(regexp_replace(v_fy_name, '[^0-9A-Za-z]', '', 'g'), 'NA')
         || '-' || lpad(v_next::text, 5, '0');
END;
$$;
