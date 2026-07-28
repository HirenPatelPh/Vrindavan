export type GoodsReceivedNoteStatus = 'draft' | 'completed' | 'cancelled';

export class GoodsReceivedNoteLine {
  constructor(
    public readonly id: string,
    public readonly grnId: string,
    public readonly poLineId: string | null,
    public readonly productId: string,
    public readonly productUnitId: string,
    public readonly batchId: string | null,
    public readonly quantity: number,
    public readonly rate: number,
    public readonly remarks: string | null,
  ) {}
}

export class GoodsReceivedNote {
  constructor(
    public readonly id: string,
    public readonly grnNumber: string,
    public readonly grnDate: Date,
    public readonly poId: string | null,
    public readonly supplierId: string,
    public readonly warehouseId: string,
    public readonly transporterId: string | null,
    public readonly status: GoodsReceivedNoteStatus,
    public readonly remarks: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: GoodsReceivedNoteLine[],
  ) {}
}

export interface CreateGoodsReceivedNoteLineProps {
  poLineId?: string;
  productId: string;
  productUnitId: string;
  batchId?: string;
  quantity: number;
  rate: number;
  remarks?: string;
}

export interface CreateGoodsReceivedNoteProps {
  poId?: string;
  supplierId: string;
  warehouseId: string;
  transporterId?: string;
  grnDate?: string;
  remarks?: string;
  lines: CreateGoodsReceivedNoteLineProps[];
}
