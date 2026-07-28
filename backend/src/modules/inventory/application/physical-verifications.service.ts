import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhysicalVerificationProps, PhysicalVerification } from '../domain/physical-verification.entity';
import {
  IPhysicalVerificationRepository,
  PHYSICAL_VERIFICATION_REPOSITORY,
} from '../domain/physical-verification.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';

@Injectable()
export class PhysicalVerificationsService {
  constructor(
    @Inject(PHYSICAL_VERIFICATION_REPOSITORY)
    private readonly physicalVerificationRepository: IPhysicalVerificationRepository,
  ) {}

  list(): Promise<PhysicalVerification[]> {
    return this.physicalVerificationRepository.findAll();
  }

  async getById(id: string): Promise<PhysicalVerification> {
    const verification = await this.physicalVerificationRepository.findById(id);
    if (!verification) throw new NotFoundException(`Physical verification ${id} not found`);
    return verification;
  }

  create(props: CreatePhysicalVerificationProps, createdBy?: string): Promise<PhysicalVerification> {
    return this.physicalVerificationRepository.createWithLines(props, createdBy);
  }

  async complete(id: string): Promise<PhysicalVerification> {
    try {
      return await this.physicalVerificationRepository.complete(id);
    } catch (err) {
      if (err instanceof DocumentNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof DocumentNotDraftError) throw new ConflictException(err.message);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.physicalVerificationRepository.delete(id);
    if (!deleted) throw new ConflictException(`Physical verification ${id} not found, or not in draft status`);
  }
}
