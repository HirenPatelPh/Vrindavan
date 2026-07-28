export type BarcodeType = 'ean13' | 'code128' | 'qr' | 'upc' | 'other';

export class ProductBarcode {
  constructor(
    public readonly id: string,
    public productId: string,
    public productUnitId: string | null,
    public barcode: string,
    public barcodeType: BarcodeType,
    public isPrimary: boolean,
    public readonly createdAt: Date,
  ) {}
}

export interface CreateProductBarcodeProps {
  productId: string;
  productUnitId?: string;
  barcode: string;
  barcodeType?: BarcodeType;
  isPrimary?: boolean;
}
