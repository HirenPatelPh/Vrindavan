import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  AccessNotFoundError,
  AdminRoleLockedError,
  DuplicateEmailError,
  LastAdminError,
  SelfModificationError,
  SystemRoleError,
} from '../domain/access.errors';

/** Translates AccessService domain errors to HTTP exceptions; re-throws anything else. */
export function mapAccessError(err: unknown): never {
  if (err instanceof AccessNotFoundError) throw new NotFoundException(err.message);
  if (err instanceof DuplicateEmailError) throw new ConflictException(err.message);
  if (
    err instanceof LastAdminError ||
    err instanceof SelfModificationError ||
    err instanceof SystemRoleError ||
    err instanceof AdminRoleLockedError
  ) {
    throw new ConflictException(err.message);
  }
  throw err;
}
