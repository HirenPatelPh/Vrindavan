-- Shared utility function used by every schema (public + all tenant schemas).
-- Lives in public so it is created exactly once; tenant triggers reference it as public.fn_set_updated_at().
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
