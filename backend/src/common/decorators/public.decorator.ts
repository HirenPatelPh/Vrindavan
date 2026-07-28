import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as not requiring authentication or tenant resolution (e.g. /health).
 * Phase 3 wires a global JwtAuthGuard that checks for this metadata; TenantContextMiddleware
 * also consults it to skip the `x-company-code` lookup entirely.
 */
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);
