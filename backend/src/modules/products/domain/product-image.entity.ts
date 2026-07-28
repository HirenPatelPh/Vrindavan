export class ProductImage {
  constructor(
    public readonly id: string,
    public productId: string,
    public imageUrl: string,
    public isPrimary: boolean,
    public sortOrder: number,
    public readonly createdAt: Date,
  ) {}
}

export interface CreateProductImageProps {
  productId: string;
  imageUrl: string;
  isPrimary?: boolean;
  sortOrder?: number;
}
