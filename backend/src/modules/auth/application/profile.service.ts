import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../domain/user.repository.interface';
import { CompanyProfile, UpdateCompanyProfileProps } from '../domain/company-profile.entity';
import {
  COMPANY_PROFILE_REPOSITORY,
  ICompanyProfileRepository,
} from '../domain/company-profile.repository.interface';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(COMPANY_PROFILE_REPOSITORY) private readonly companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, props: Partial<Pick<User, 'name' | 'phone'>>): Promise<User> {
    const updated = await this.userRepository.updateProfile(userId, props);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async getCompanyProfile(tenantId: string): Promise<CompanyProfile> {
    const company = await this.companyProfileRepository.findByTenantId(tenantId);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async updateCompanyProfile(tenantId: string, props: UpdateCompanyProfileProps): Promise<CompanyProfile> {
    const updated = await this.companyProfileRepository.update(tenantId, props);
    if (!updated) throw new NotFoundException('Company not found');
    return updated;
  }
}
