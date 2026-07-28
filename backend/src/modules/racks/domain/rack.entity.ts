export class Rack {
  constructor(
    public readonly id: string,
    public warehouseId: string,
    public name: string,
    public code: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateRackProps {
  warehouseId: string;
  name: string;
  code: string;
  isActive?: boolean;
}

export type UpdateRackProps = Partial<CreateRackProps>;
