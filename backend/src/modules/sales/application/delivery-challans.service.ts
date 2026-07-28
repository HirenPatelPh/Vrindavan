import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeliveryChallanProps, DeliveryChallan } from '../domain/delivery-challan.entity';
import {
  DELIVERY_CHALLAN_REPOSITORY,
  IDeliveryChallanRepository,
} from '../domain/delivery-challan.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';
import { InsufficientStockError } from '../../inventory/domain/inventory-document.errors';

@Injectable()
export class DeliveryChallansService {
  constructor(
    @Inject(DELIVERY_CHALLAN_REPOSITORY) private readonly dcRepository: IDeliveryChallanRepository,
  ) {}

  list(): Promise<DeliveryChallan[]> {
    return this.dcRepository.findAll();
  }

  async getById(id: string): Promise<DeliveryChallan> {
    const dc = await this.dcRepository.findById(id);
    if (!dc) throw new NotFoundException(`Delivery challan ${id} not found`);
    return dc;
  }

  create(props: CreateDeliveryChallanProps, createdBy?: string): Promise<DeliveryChallan> {
    return this.dcRepository.createWithLines(props, createdBy);
  }

  async deliver(id: string): Promise<DeliveryChallan> {
    try {
      return await this.dcRepository.deliver(id);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      if (error instanceof InsufficientStockError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.dcRepository.delete(id);
    if (!deleted) throw new ConflictException(`Delivery challan ${id} not found, or not in draft status`);
  }
}
