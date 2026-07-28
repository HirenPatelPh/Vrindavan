export class Warehouse {
  constructor(
    public readonly id: string,
    public branchId: string,
    public name: string,
    public code: string,
    public addressLine1: string | null,
    public city: string | null,
    public state: string | null,
    public pincode: string | null,
    public managerId: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateWarehouseProps {
  branchId: string;
  name: string;
  code: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  managerId?: string;
  isActive?: boolean;
}

export type UpdateWarehouseProps = Partial<CreateWarehouseProps>;
