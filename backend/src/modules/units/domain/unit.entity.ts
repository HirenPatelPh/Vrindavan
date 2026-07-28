export class Unit {
  constructor(
    public readonly id: string,
    public name: string,
    public shortCode: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateUnitProps {
  name: string;
  shortCode: string;
  isActive?: boolean;
}

export interface UpdateUnitProps {
  name?: string;
  shortCode?: string;
  isActive?: boolean;
}
