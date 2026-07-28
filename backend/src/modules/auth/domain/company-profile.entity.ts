export class CompanyProfile {
  constructor(
    public readonly id: string,
    public readonly companyCode: string,
    public companyName: string,
    public companyEmail: string,
    public companyPhone: string | null,
    public logoUrl: string | null,
    public primaryColor: string | null,
    public timezone: string,
    public readonly plan: string,
    public readonly status: string,
  ) {}
}

export interface UpdateCompanyProfileProps {
  companyName?: string;
  companyPhone?: string;
  logoUrl?: string;
  primaryColor?: string;
  timezone?: string;
}
