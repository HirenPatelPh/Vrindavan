export class Employee {
  constructor(
    public readonly id: string,
    public userId: string | null,
    public name: string,
    public code: string,
    public designation: string | null,
    public department: string | null,
    public phone: string | null,
    public email: string | null,
    public joiningDate: Date | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateEmployeeProps {
  userId?: string;
  name: string;
  code: string;
  designation?: string;
  department?: string;
  phone?: string;
  email?: string;
  joiningDate?: string;
  isActive?: boolean;
}

export type UpdateEmployeeProps = Partial<CreateEmployeeProps>;
