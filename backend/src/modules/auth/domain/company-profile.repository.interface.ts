import { CompanyProfile, UpdateCompanyProfileProps } from './company-profile.entity';

export const COMPANY_PROFILE_REPOSITORY = Symbol('COMPANY_PROFILE_REPOSITORY');

export interface ICompanyProfileRepository {
  findByTenantId(tenantId: string): Promise<CompanyProfile | null>;
  update(tenantId: string, props: UpdateCompanyProfileProps): Promise<CompanyProfile | null>;
}
