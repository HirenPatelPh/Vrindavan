export type OtpPurpose = 'login' | 'forgot_password' | 'change_password';

export class Otp {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly purpose: OtpPurpose,
    public readonly codeHash: string,
    public readonly expiresAt: Date,
    public consumedAt: Date | null,
    public readonly createdAt: Date,
  ) {}
}
