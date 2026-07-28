import { GstRate, CreateGstRateProps, UpdateGstRateProps } from './gst-rate.entity';

export const GST_RATE_REPOSITORY = Symbol('GST_RATE_REPOSITORY');

export interface IGstRateRepository {
  findAll(): Promise<GstRate[]>;
  findById(id: string): Promise<GstRate | null>;
  create(props: CreateGstRateProps): Promise<GstRate>;
  update(id: string, props: UpdateGstRateProps): Promise<GstRate | null>;
  delete(id: string): Promise<boolean>;
}
