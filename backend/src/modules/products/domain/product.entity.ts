export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public sku: string,
    public barcode: string | null,
    public qrCode: string | null,
    public categoryId: string,
    public subCategoryId: string | null,
    public brandId: string | null,
    public hsnId: string | null,
    public gstId: string | null,
    public baseUnitId: string,
    public purchasePrice: number,
    public sellingPrice: number,
    public mrp: number | null,
    public minimumStock: number,
    public maximumStock: number | null,
    public reorderLevel: number,
    public openingStock: number,
    public piecesPerBox: number | null,
    public piecesPerBag: number | null,
    public weight: number | null,
    public weightUnit: string | null,
    public dimensionLength: number | null,
    public dimensionWidth: number | null,
    public dimensionHeight: number | null,
    public dimensionUnit: string | null,
    public hasBatchTracking: boolean,
    public hasExpiryTracking: boolean,
    public remarks: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export interface CreateProductProps {
  name: string;
  sku: string;
  barcode?: string;
  qrCode?: string;
  categoryId: string;
  subCategoryId?: string;
  brandId?: string;
  hsnId?: string;
  gstId?: string;
  baseUnitId: string;
  purchasePrice?: number;
  sellingPrice?: number;
  mrp?: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderLevel?: number;
  openingStock?: number;
  piecesPerBox?: number;
  piecesPerBag?: number;
  weight?: number;
  weightUnit?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  dimensionUnit?: string;
  hasBatchTracking?: boolean;
  hasExpiryTracking?: boolean;
  remarks?: string;
  isActive?: boolean;
}

export type UpdateProductProps = Partial<CreateProductProps>;
