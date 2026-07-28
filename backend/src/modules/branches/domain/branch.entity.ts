export class Branch {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public isHeadOffice: boolean,
    public addressLine1: string | null,
    public addressLine2: string | null,
    public city: string | null,
    public state: string | null,
    public country: string | null,
    public pincode: string | null,
    public phone: string | null,
    public email: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateBranchProps {
  name: string;
  code: string;
  isHeadOffice?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export type UpdateBranchProps = Partial<CreateBranchProps>;
