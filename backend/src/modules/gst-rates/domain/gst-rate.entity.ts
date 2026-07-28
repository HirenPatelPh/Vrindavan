export class GstRate {
  constructor(
    public readonly id: string,
    public name: string,
    public totalRate: number,
    public cgstRate: number,
    public sgstRate: number,
    public igstRate: number,
    public isActive: boolean,
  ) {}
}

export interface CreateGstRateProps {
  name: string;
  totalRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  isActive?: boolean;
}

export type UpdateGstRateProps = Partial<CreateGstRateProps>;
