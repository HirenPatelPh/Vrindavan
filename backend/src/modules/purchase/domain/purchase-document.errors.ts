/**
 * Local to Purchase — deliberately not imported from inventory/domain/inventory-document.errors.ts
 * (see Phase 6 plan's "Reused infrastructure" section: these are trivial marker classes, and
 * keeping Purchase's domain layer independent of Inventory's domain layer is worth the two-line
 * duplication). Thrown by repositories from inside a draft-check transaction (see
 * inventory-document.errors.ts for the full rationale) and caught by services, translated to
 * NotFoundException/ConflictException.
 */
export class DocumentNotFoundError extends Error {}
export class DocumentNotDraftError extends Error {}

/** Thrown by SupplierPaymentKyselyRepository.createWithAllocations() for a bad allocation (wrong supplier, or amount exceeding the invoice's outstanding balance). Mapped to BadRequestException, not ConflictException — it's a validation failure, not a status race. */
export class InvalidAllocationError extends Error {}
