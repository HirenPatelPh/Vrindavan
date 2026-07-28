import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { GstRatesService } from '../application/gst-rates.service';
import { CreateGstRateDto } from './dto/create-gst-rate.dto';
import { UpdateGstRateDto } from './dto/update-gst-rate.dto';
import { GstRateResponseDto } from './dto/gst-rate-response.dto';

@ApiTags('gst-rates')
@Controller('gst-rates')
export class GstRatesController {
  constructor(private readonly gstRatesService: GstRatesService) {}

  @RequirePermissions('gst_rates.view')
  @Get()
  async list(): Promise<GstRateResponseDto[]> {
    const items = await this.gstRatesService.list();
    return items.map((i) => new GstRateResponseDto(i));
  }

  @RequirePermissions('gst_rates.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<GstRateResponseDto> {
    return new GstRateResponseDto(await this.gstRatesService.getById(id));
  }

  @RequirePermissions('gst_rates.create')
  @Post()
  async create(@Body() dto: CreateGstRateDto): Promise<GstRateResponseDto> {
    return new GstRateResponseDto(await this.gstRatesService.create(dto));
  }

  @RequirePermissions('gst_rates.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGstRateDto): Promise<GstRateResponseDto> {
    return new GstRateResponseDto(await this.gstRatesService.update(id, dto));
  }

  @RequirePermissions('gst_rates.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.gstRatesService.remove(id);
  }
}
