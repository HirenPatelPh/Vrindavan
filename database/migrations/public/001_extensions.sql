-- Extensions required across the platform (public + every tenant schema).
-- pgcrypto: gen_random_uuid() for UUID primary keys (offline-sync friendly client-generated IDs).
-- pg_trgm: trigram indexes for fast partial-text product/customer/supplier search ("Search Everywhere").
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
