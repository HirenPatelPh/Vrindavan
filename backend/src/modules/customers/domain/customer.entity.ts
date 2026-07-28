export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public contactPerson: string | null,
    public email: string | null,
    public phone: string | null,
    public gstin: string | null,
    public pan: string | null,
    public addressLine1: string | null,
    public addressLine2: string | null,
    public city: string | null,
    public state: string | null,
    public country: string | null,
    public pincode: string | null,
    public creditLimit: number,
    public creditPeriodDays: number,
    public openingBalance: number,
    public isBlocked: boolean,
    public blockedReason: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateCustomerProps {
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  creditLimit?: number;
  creditPeriodDays?: number;
  openingBalance?: number;
  isBlocked?: boolean;
  blockedReason?: string;
  isActive?: boolean;
}

export type UpdateCustomerProps = Partial<CreateCustomerProps>;
