export type PhysicalVerificationStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

export class PhysicalVerificationLine {
  constructor(
    public readonly id: string,
    public readonly verificationId: string,
    public readonly productId: string,
    public readonly batchId: string | null,
    public readonly rackId: string | null,
    public readonly locationId: string | null,
    public readonly systemQuantity: number,
    public readonly countedQuantity: number,
    public readonly difference: number | null,
    public readonly remarks: string | null,
  ) {}
}

export class PhysicalVerification {
  constructor(
    public readonly id: string,
    public readonly verificationNumber: string,
    public readonly verificationDate: Date,
    public readonly warehouseId: string,
    public readonly status: PhysicalVerificationStatus,
    public readonly createdBy: string | null,
    public readonly completedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lines: PhysicalVerificationLine[],
  ) {}
}

export interface CreatePhysicalVerificationLineProps {
  productId: string;
  batchId?: string;
  rackId?: string;
  locationId?: string;
  countedQuantity: number;
  remarks?: string;
}

export interface CreatePhysicalVerificationProps {
  warehouseId: string;
  verificationDate?: string;
  lines: CreatePhysicalVerificationLineProps[];
}
