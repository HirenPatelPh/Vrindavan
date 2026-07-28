# syntax=docker/dockerfile:1
#
# Vrindavan backend (NestJS) production image.
#
# Two things make this image non-trivial and are load-bearing — do not "simplify" them away:
#
#  1. The image preserves the repo's RELATIVE layout: the app lives at /app/backend and the SQL
#     lives at /app/database. This is required because the migration runner resolves its SQL dir
#     as `../../../../database` (from dist/infrastructure/migrations) and tenant provisioning
#     resolves seeds as `../../../../../database/seed` (from dist/modules/signup/infrastructure).
#     With WORKDIR /app/backend, both resolve to /app/database. Move either and signup/migrate
#     break at runtime, not build time.
#
#  2. The runtime stage installs postgresql-client-18. The backend SHELLS OUT to `pg_dump` and
#     `psql` when a new tenant signs up (it clones the tenant_template schema). pg_dump must be
#     >= the Postgres server major version (18 here), and the server emits \restrict meta-commands
#     that only psql understands. Debian's bundled client is too old — the PGDG repo is the fix.

# ---------- builder ----------
FROM node:20-bookworm AS builder
WORKDIR /app/backend

# Install deps first (better layer caching). Native module (bcrypt) compiles here on bookworm;
# the runtime stage is bookworm-slim (same glibc), so the compiled binary is copied forward as-is.
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build \
    && npm prune --omit=dev

# ---------- runtime ----------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production

# postgresql-client-18 from the official PGDG apt repo (needed for tenant signup: pg_dump | psql).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
         -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" \
         > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-18 \
    && apt-get purge -y --auto-remove gnupg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# App code + pruned prod node_modules from the builder.
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json

# SQL lives at /app/database so the runtime path resolution described above lands correctly.
COPY database/ /app/database/

# Product-image uploads directory (also declared as a named volume in compose so it survives
# redeploys). process.cwd() is /app/backend, and the app writes to ./uploads.
RUN mkdir -p /app/backend/uploads
VOLUME ["/app/backend/uploads"]

EXPOSE 3000
CMD ["node", "dist/main.js"]
