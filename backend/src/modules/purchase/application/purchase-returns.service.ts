import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseReturnProps, PurchaseReturn } from '../domain/purchase-return.entity';
import { IPurchaseReturnRepository, PURCHASE_RETURN_REPOSITORY } from '../domain/purchase-return.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/purchase-document.errors';
import { InsufficientStockError } from '../../inventory/domain/inventory-document.errors';

@Injectable()
export class PurchaseReturnsService {
  constructor(
    @Inject(PURCHASE_RETURN_REPOSITORY) private readonly purchaseReturnRepository: IPurchaseReturnRepository,
  ) {}

  list(): Promise<PurchaseReturn[]> {
    return this.purchaseReturnRepository.findAll();
  }

  async getById(id: string): Promise<PurchaseReturn> {
    const ret = await this.purchaseReturnRepository.findById(id);
    if (!ret) throw new NotFoundException(`Purchase return ${id} not found`);
    return ret;
  }

  create(props: CreatePurchaseReturnProps, createdBy?: string): Promise<PurchaseReturn> {
    return this.purchaseReturnRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<PurchaseReturn> {
    try {
      return await this.purchaseReturnRepository.approve(id, approvedBy);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      if (error instanceof InsufficientStockError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.purchaseReturnRepository.delete(id);
    if (!deleted) throw new ConflictException(`Purchase return ${id} not found, or not in draft status`);
  }
}
