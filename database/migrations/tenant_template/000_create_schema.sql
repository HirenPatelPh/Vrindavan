-- The canonical tenant structure. This schema is never used to serve live traffic —
-- it is the template cloned (via pg_dump --schema-only | sed | psql) into a real
-- tenant_<code> schema for every company that signs up. See /database/README.md.
CREATE SCHEMA IF NOT EXISTS tenant_template;
