export class HsnCode {
  constructor(
    public readonly id: string,
    public code: string,
    public description: string | null,
    public defaultGstId: string | null,
    public isActive: boolean,
  ) {}
}

export interface CreateHsnCodeProps {
  code: string;
  description?: string;
  defaultGstId?: string;
  isActive?: boolean;
}

export type UpdateHsnCodeProps = Partial<CreateHsnCodeProps>;
