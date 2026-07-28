export class Location {
  constructor(
    public readonly id: string,
    public rackId: string,
    public name: string,
    public code: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateLocationProps {
  rackId: string;
  name: string;
  code: string;
  isActive?: boolean;
}

export type UpdateLocationProps = Partial<CreateLocationProps>;
