-- Generic audit trigger: writes a before/after row into audit_logs for every insert/update/
-- delete on the tables it's attached to. Attached below to the tables where a full change
-- history actually matters (masters + all transactional headers) — not to *_lines child
-- tables, whose changes are implied by their header's audit row.
SET search_path TO tenant_template, public;

CREATE OR REPLACE FUNCTION tenant_template.trg_audit_log()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- The application sets this per-session via `SET LOCAL app.current_user_id = '<uuid>'`
  -- immediately after authenticating (Phase 2 backend). Falls back to NULL outside a request.
  BEGIN
    v_user_id := current_setting('app.current_user_id', true)::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO tenant_template.audit_logs (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), v_user_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO tenant_template.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), v_user_id);
    RETURN NEW;
  ELSE
    INSERT INTO tenant_template.audit_logs (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'insert', to_jsonb(NEW), v_user_id);
    RETURN NEW;
  END IF;
END;
$$;

DO $$
DECLARE
  t text;
  audited_tables text[] := ARRAY[
    'products','suppliers','customers','employees',
    'purchase_orders','goods_received_notes','purchase_invoices','supplier_payments','purchase_returns',
    'quotations','sales_orders','delivery_challans','sales_invoices','customer_payments','sales_returns',
    'stock_adjustments','stock_transfers','physical_verifications','damaged_stock','stock_returns',
    'roles','users'
    -- NOTE: junction tables with a composite PK and no surrogate `id` (role_permissions,
    -- user_roles, *_lines child tables) are deliberately excluded — trg_audit_log() assumes
    -- NEW.id/OLD.id exists. Their changes are implied by their parent header's audit row.
  ];
BEGIN
  FOREACH t IN ARRAY audited_tables LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON tenant_template.%1$s
       FOR EACH ROW EXECUTE FUNCTION tenant_template.trg_audit_log();', t
    );
  END LOOP;
END;
$$;
