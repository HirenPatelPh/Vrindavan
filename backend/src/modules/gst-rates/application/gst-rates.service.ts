import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GstRate, CreateGstRateProps, UpdateGstRateProps } from '../domain/gst-rate.entity';
import { GST_RATE_REPOSITORY, IGstRateRepository } from '../domain/gst-rate.repository.interface';

@Injectable()
export class GstRatesService {
  constructor(@Inject(GST_RATE_REPOSITORY) private readonly gstRateRepository: IGstRateRepository) {}

  list(): Promise<GstRate[]> {
    return this.gstRateRepository.findAll();
  }

  async getById(id: string): Promise<GstRate> {
    const gstRate = await this.gstRateRepository.findById(id);
    if (!gstRate) throw new NotFoundException(`GST rate ${id} not found`);
    return gstRate;
  }

  create(props: CreateGstRateProps): Promise<GstRate> {
    return this.gstRateRepository.create(props);
  }

  async update(id: string, props: UpdateGstRateProps): Promise<GstRate> {
    const updated = await this.gstRateRepository.update(id, props);
    if (!updated) throw new NotFoundException(`GST rate ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.gstRateRepository.delete(id);
    if (!deleted) throw new NotFoundException(`GST rate ${id} not found`);
  }
}
