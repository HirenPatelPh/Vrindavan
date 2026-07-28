import { Otp, OtpPurpose } from './otp.entity';

export const OTP_REPOSITORY = Symbol('OTP_REPOSITORY');

export interface IOtpRepository {
  create(userId: string, purpose: OtpPurpose, codeHash: string, expiresAt: Date): Promise<Otp>;
  /** The most recent, still-valid (not consumed, not expired) OTP for this user+purpose. */
  findLatestActive(userId: string, purpose: OtpPurpose): Promise<Otp | null>;
  markConsumed(id: string): Promise<void>;
}
