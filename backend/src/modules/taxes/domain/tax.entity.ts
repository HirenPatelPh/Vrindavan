export type TaxType = 'gst' | 'vat' | 'cess' | 'custom_duty' | 'other';

export class Tax {
  constructor(
    public readonly id: string,
    public name: string,
    public taxType: TaxType,
    public rate: number,
    public isActive: boolean,
  ) {}
}

export interface CreateTaxProps {
  name: string;
  taxType: TaxType;
  rate: number;
  isActive?: boolean;
}

export type UpdateTaxProps = Partial<CreateTaxProps>;
