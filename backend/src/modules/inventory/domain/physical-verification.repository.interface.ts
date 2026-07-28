import { CreatePhysicalVerificationProps, PhysicalVerification } from './physical-verification.entity';

export const PHYSICAL_VERIFICATION_REPOSITORY = Symbol('PHYSICAL_VERIFICATION_REPOSITORY');

export interface IPhysicalVerificationRepository {
  findAll(): Promise<PhysicalVerification[]>;
  findById(id: string): Promise<PhysicalVerification | null>;
  createWithLines(props: CreatePhysicalVerificationProps, createdBy?: string): Promise<PhysicalVerification>;
  /**
   * Throws DocumentNotFoundError / DocumentNotDraftError. Recomputes each line's diff against
   * the LIVE balance at completion time. physical_verifications has no approved_by/completed_by
   * column (unlike the other 4 document types) — only completed_at — so there's no actor param here.
   */
  complete(id: string): Promise<PhysicalVerification>;
  delete(id: string): Promise<boolean>;
}
