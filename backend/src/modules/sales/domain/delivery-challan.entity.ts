export type DeliveryChallanStatus = 'draft' | 'dispatched' | 'delivered' | 'cancelled';

export class DeliveryChallanLine {
  constructor(
    public readonly id: string,
    public readonly dcId: string,
    public readonly soLineId: string | null,
    public readonly productId: string,
    public readonly productUnitId: string,
    public readonly batchId: string | null,
    public readonly quantity: number,
    public readonly remarks: string | null,
  ) {}
}

export class DeliveryChallan {
  constructor(
    public readonly id: string,
    public readonly dcNumber: string,
    public readonly dcDate: Date,
    public readonly soId: string | null,
    public readonly customerId: string,
    public readonly warehouseId: string,
    public readonly transporterId: string | null,
    public readonly status: DeliveryChallanStatus,
    public readonly remarks: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: DeliveryChallanLine[],
  ) {}
}

export interface CreateDeliveryChallanLineProps {
  soLineId?: string;
  productId: string;
  productUnitId: string;
  batchId?: string;
  quantity: number;
  remarks?: string;
}

export interface CreateDeliveryChallanProps {
  soId?: string;
  customerId: string;
  warehouseId: string;
  transporterId?: string;
  dcDate?: string;
  remarks?: string;
  lines: CreateDeliveryChallanLineProps[];
}
