import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'requiredPermissions';

/**
 * Declares which `permissions.code` values (see /database/migrations/tenant_template/001_master_org.sql
 * and /database/seed/001_roles_permissions.sql, e.g. "products.create") a route requires.
 * Scaffolded now so every controller only needs to be annotated once; PermissionsGuard's
 * actual enforcement logic lands in Phase 3 once req.user carries the authenticated user's
 * granted permission codes.
 */
export const RequirePermissions = (...codes: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERMISSIONS_KEY, codes);
