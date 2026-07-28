import { CreateDeliveryChallanProps, DeliveryChallan } from './delivery-challan.entity';

export const DELIVERY_CHALLAN_REPOSITORY = Symbol('DELIVERY_CHALLAN_REPOSITORY');

export interface IDeliveryChallanRepository {
  findAll(): Promise<DeliveryChallan[]>;
  findById(id: string): Promise<DeliveryChallan | null>;
  createWithLines(props: CreateDeliveryChallanProps, createdBy?: string): Promise<DeliveryChallan>;
  /**
   * draft -> delivered (skips the schema's 'dispatched' intermediate — see Phase 7 plan).
   * Posts sales_out per line at live average cost (unit-converted to base units), rolls up the
   * linked SO line's delivered_quantity and the SO's own status. Throws
   * DocumentNotFoundError/DocumentNotDraftError.
   */
  deliver(id: string): Promise<DeliveryChallan>;
  delete(id: string): Promise<boolean>;
}
