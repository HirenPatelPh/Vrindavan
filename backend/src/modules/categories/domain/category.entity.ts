export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateCategoryProps {
  name: string;
  code: string;
  isActive?: boolean;
}

export type UpdateCategoryProps = Partial<CreateCategoryProps>;
