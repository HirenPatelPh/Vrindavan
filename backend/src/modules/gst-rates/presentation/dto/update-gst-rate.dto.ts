import { PartialType } from '@nestjs/swagger';
import { CreateGstRateDto } from './create-gst-rate.dto';

export class UpdateGstRateDto extends PartialType(CreateGstRateDto) {}
