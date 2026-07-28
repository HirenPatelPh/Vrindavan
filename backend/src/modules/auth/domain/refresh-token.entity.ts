export class RefreshToken {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public revokedAt: Date | null,
    public readonly createdAt: Date,
  ) {}
}
