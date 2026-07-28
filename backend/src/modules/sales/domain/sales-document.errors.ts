/**
 * Local to Sales — deliberately not imported from inventory/domain/inventory-document.errors.ts
 * or purchase/domain/purchase-document.errors.ts (see Phase 6/7 plans' "Reused infrastructure"
 * sections: these are trivial marker classes, and keeping each module's domain layer
 * independent of the others is worth the few lines of duplication). Thrown by repositories from
 * inside a status-check transaction and caught by services, translated to
 * NotFoundException/ConflictException/BadRequestException.
 */
export class DocumentNotFoundError extends Error {}
export class DocumentNotDraftError extends Error {}

/** Thrown by CustomerPaymentKyselyRepository.createWithAllocations() for a bad allocation (wrong customer, or amount exceeding the invoice's outstanding balance). Mapped to BadRequestException. */
export class InvalidAllocationError extends Error {}
