export class Brand {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public logoUrl: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateBrandProps {
  name: string;
  code: string;
  logoUrl?: string;
  isActive?: boolean;
}

export type UpdateBrandProps = Partial<CreateBrandProps>;
