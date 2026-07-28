export class ProductUnit {
  constructor(
    public readonly id: string,
    public productId: string,
    public unitId: string,
    public isBaseUnit: boolean,
    public conversionFactor: number,
    public purchasePrice: number | null,
    public sellingPrice: number | null,
    public barcode: string | null,
    public readonly createdAt: Date,
  ) {}
}

export interface CreateProductUnitProps {
  productId: string;
  unitId: string;
  isBaseUnit?: boolean;
  conversionFactor: number;
  purchasePrice?: number;
  sellingPrice?: number;
  barcode?: string;
}

export type UpdateProductUnitProps = Partial<Omit<CreateProductUnitProps, 'productId'>>;
