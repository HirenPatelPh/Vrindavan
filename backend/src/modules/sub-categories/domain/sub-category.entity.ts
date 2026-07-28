export class SubCategory {
  constructor(
    public readonly id: string,
    public categoryId: string,
    public name: string,
    public code: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateSubCategoryProps {
  categoryId: string;
  name: string;
  code: string;
  isActive?: boolean;
}

export type UpdateSubCategoryProps = Partial<CreateSubCategoryProps>;
