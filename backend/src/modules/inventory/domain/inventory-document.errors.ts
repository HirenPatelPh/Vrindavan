/**
 * Thrown by repositories from inside an approve() transaction (header-not-found / wrong-status
 * checks must happen there, atomically with the posting — a separate pre-check in the service
 * layer would race against concurrent approve calls). Services catch these and translate to
 * NotFoundException/ConflictException, keeping NestJS-specific exceptions out of the
 * infrastructure layer everywhere else in this codebase.
 */
export class DocumentNotFoundError extends Error {}
export class DocumentNotDraftError extends Error {}

/**
 * Thrown from inside an approve() transaction when an outbound movement would drive a
 * warehouse's stock negative (which the DB's `stock_balances_check` constraint rejects). Caught
 * in the service layer and translated to a ConflictException so the client gets a clear
 * "insufficient stock" message instead of a raw 500 database error.
 */
export class InsufficientStockError extends Error {}

/** Thrown by OpeningStockKyselyRepository.post() when a product's opening stock was already posted (checked inside the same transaction as the insert, for the same atomicity reason as above). */
export class OpeningStockAlreadyPostedError extends Error {}
