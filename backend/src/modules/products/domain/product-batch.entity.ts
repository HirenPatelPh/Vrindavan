export class ProductBatch {
  constructor(
    public readonly id: string,
    public productId: string,
    public batchNumber: string,
    public lotNumber: string | null,
    public manufacturingDate: Date | null,
    public expiryDate: Date | null,
    public readonly createdAt: Date,
  ) {}
}

export interface CreateProductBatchProps {
  productId: string;
  batchNumber: string;
  lotNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
}

export type UpdateProductBatchProps = Partial<Omit<CreateProductBatchProps, 'productId'>>;
