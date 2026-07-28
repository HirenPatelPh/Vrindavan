export class Transporter {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public contactPerson: string | null,
    public phone: string | null,
    public vehicleNumber: string | null,
    public gstNumber: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateTransporterProps {
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  vehicleNumber?: string;
  gstNumber?: string;
  isActive?: boolean;
}

export type UpdateTransporterProps = Partial<CreateTransporterProps>;
