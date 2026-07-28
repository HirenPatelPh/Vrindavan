export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly email: string,
    public phone: string | null,
    public passwordHash: string,
    public isActive: boolean,
    public mustChangePassword: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
