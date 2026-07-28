import { randomInt } from 'crypto';

/** Cryptographically random 6-digit numeric code, zero-padded (e.g. "042317"). */
export function generateNumericOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}
