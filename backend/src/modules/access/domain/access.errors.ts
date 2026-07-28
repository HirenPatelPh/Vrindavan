/**
 * Guardrail errors thrown by AccessService and translated to HTTP exceptions in the controllers
 * (kept out of the infrastructure layer, same convention as the rest of the codebase).
 */

/** A change (deactivating a user, removing the Admin role) would leave the tenant with no active admin. */
export class LastAdminError extends Error {}

/** An admin tried to deactivate / strip the Admin role from their own account. */
export class SelfModificationError extends Error {}

/** Tried to delete or rename a built-in (`is_system_role`) role. */
export class SystemRoleError extends Error {}

/** Tried to edit the Admin role's permission set (Admin is always full access). */
export class AdminRoleLockedError extends Error {}

/** A referenced user / role / permission code does not exist. */
export class AccessNotFoundError extends Error {}

/** Email already in use by another user in this tenant. */
export class DuplicateEmailError extends Error {}
