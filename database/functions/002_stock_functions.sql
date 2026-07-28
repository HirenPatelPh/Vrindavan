-- Core inventory invariant: stock_balances is NEVER written directly by application code.
-- It is maintained purely by these triggers, reacting to stock_ledger / reserved_stock /
-- blocked_stock_entries changes. This keeps "current stock" always derivable and auditable.
SET search_path TO tenant_template, public;

-- ---------- stock_ledger -> stock_balances (physical quantity + moving-average cost) -------
CREATE OR REPLACE FUNCTION tenant_template.trg_stock_ledger_to_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_delta       numeric(18,3) := NEW.qty_in - NEW.qty_out;
  v_existing_qty numeric(18,3);
  v_existing_cost numeric(18,4);
  v_new_avg_cost  numeric(18,4);
BEGIN
  SELECT quantity, average_cost INTO v_existing_qty, v_existing_cost
  FROM tenant_template.stock_balances
  WHERE product_id = NEW.product_id
    AND warehouse_id = NEW.warehouse_id
    AND COALESCE(rack_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.rack_id, '00000000-0000-0000-0000-000000000000')
    AND COALESCE(location_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.location_id, '00000000-0000-0000-0000-000000000000')
    AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.batch_id, '00000000-0000-0000-0000-000000000000')
  FOR UPDATE;

  IF NOT FOUND THEN
    v_existing_qty := 0;
    v_existing_cost := 0;
  END IF;

  -- Weighted moving average cost, only recomputed on stock-in movements with a positive cost.
  -- (v_existing_qty/v_existing_cost were coerced to 0 above when no row exists yet; this
  -- plpgsql assignment doesn't touch FOUND, so the branch below still reflects the SELECT.)
  IF NEW.qty_in > 0 AND NEW.unit_cost > 0 THEN
    v_new_avg_cost := ((v_existing_qty * v_existing_cost) + (NEW.qty_in * NEW.unit_cost))
                      / NULLIF(v_existing_qty + NEW.qty_in, 0);
  ELSE
    v_new_avg_cost := v_existing_cost;
  END IF;

  -- Deliberately NOT "INSERT ... ON CONFLICT DO UPDATE": Postgres validates CHECK
  -- constraints against the tentative INSERT row before it even evaluates whether a
  -- conflict exists, so a plain upsert would reject a valid stock-out (e.g. existing
  -- qty 100, qty_out 90 -> delta -90) purely because -90 alone fails `quantity >= 0`,
  -- even though the post-update total (10) is perfectly valid. Branching explicitly on
  -- FOUND (from the FOR UPDATE select above) sidesteps that Postgres upsert gotcha.
  IF FOUND THEN
    UPDATE tenant_template.stock_balances
    SET quantity     = quantity + v_delta,
        average_cost = COALESCE(v_new_avg_cost, average_cost),
        updated_at   = now()
    WHERE product_id = NEW.product_id
      AND warehouse_id = NEW.warehouse_id
      AND COALESCE(rack_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.rack_id, '00000000-0000-0000-0000-000000000000')
      AND COALESCE(location_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.location_id, '00000000-0000-0000-0000-000000000000')
      AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.batch_id, '00000000-0000-0000-0000-000000000000');
  ELSE
    INSERT INTO tenant_template.stock_balances (product_id, warehouse_id, rack_id, location_id, batch_id, quantity, average_cost)
    VALUES (NEW.product_id, NEW.warehouse_id, NEW.rack_id, NEW.location_id, NEW.batch_id, v_delta, COALESCE(v_new_avg_cost, 0));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stock_ledger_to_balance
  AFTER INSERT ON tenant_template.stock_ledger
  FOR EACH ROW EXECUTE FUNCTION tenant_template.trg_stock_ledger_to_balance();

-- ---------- reserved_stock -> stock_balances.reserved_quantity -----------------------------
CREATE OR REPLACE FUNCTION tenant_template.trg_reserved_stock_to_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tenant_template.stock_balances
    SET reserved_quantity = reserved_quantity + NEW.quantity, updated_at = now()
    WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id
      AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.batch_id, '00000000-0000-0000-0000-000000000000');
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status <> 'active' THEN
    UPDATE tenant_template.stock_balances
    SET reserved_quantity = GREATEST(reserved_quantity - OLD.quantity, 0), updated_at = now()
    WHERE product_id = OLD.product_id AND warehouse_id = OLD.warehouse_id
      AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(OLD.batch_id, '00000000-0000-0000-0000-000000000000');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reserved_stock_to_balance
  AFTER INSERT OR UPDATE ON tenant_template.reserved_stock
  FOR EACH ROW EXECUTE FUNCTION tenant_template.trg_reserved_stock_to_balance();

-- "Auto Release Reserved Stock": called on a schedule (Phase 2 backend cron) to expire
-- reservations past their expires_at. The status flip above triggers the balance update.
CREATE OR REPLACE FUNCTION tenant_template.fn_release_expired_reservations()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE tenant_template.reserved_stock
  SET status = 'expired', released_at = now()
  WHERE status = 'active' AND expires_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ---------- blocked_stock_entries -> stock_balances.blocked_quantity -----------------------
CREATE OR REPLACE FUNCTION tenant_template.trg_blocked_stock_to_balance()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tenant_template.stock_balances
    SET blocked_quantity = blocked_quantity + NEW.quantity, updated_at = now()
    WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id
      AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(NEW.batch_id, '00000000-0000-0000-0000-000000000000');
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'blocked' AND NEW.status = 'released' THEN
    UPDATE tenant_template.stock_balances
    SET blocked_quantity = GREATEST(blocked_quantity - OLD.quantity, 0), updated_at = now()
    WHERE product_id = OLD.product_id AND warehouse_id = OLD.warehouse_id
      AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(OLD.batch_id, '00000000-0000-0000-0000-000000000000');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blocked_stock_to_balance
  AFTER INSERT OR UPDATE ON tenant_template.blocked_stock_entries
  FOR EACH ROW EXECUTE FUNCTION tenant_template.trg_blocked_stock_to_balance();
