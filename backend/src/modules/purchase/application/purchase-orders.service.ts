import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseOrderProps, PurchaseOrder } from '../domain/purchase-order.entity';
import { IPurchaseOrderRepository, PURCHASE_ORDER_REPOSITORY } from '../domain/purchase-order.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/purchase-document.errors';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY) private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  list(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.findAll();
  }

  async getById(id: string): Promise<PurchaseOrder> {
    const po = await this.purchaseOrderRepository.findById(id);
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);
    return po;
  }

  create(props: CreatePurchaseOrderProps, createdBy?: string): Promise<PurchaseOrder> {
    return this.purchaseOrderRepository.createWithLines(props, createdBy);
  }

  async approve(id: string, approvedBy?: string): Promise<PurchaseOrder> {
    try {
      return await this.purchaseOrderRepository.approve(id, approvedBy);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    try {
      return await this.purchaseOrderRepository.cancel(id);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.purchaseOrderRepository.delete(id);
    if (!deleted) throw new ConflictException(`Purchase order ${id} not found, or not in draft status`);
  }
}
