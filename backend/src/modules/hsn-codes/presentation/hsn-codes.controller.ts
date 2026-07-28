import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { HsnCodesService } from '../application/hsn-codes.service';
import { CreateHsnCodeDto } from './dto/create-hsn-code.dto';
import { UpdateHsnCodeDto } from './dto/update-hsn-code.dto';
import { HsnCodeResponseDto } from './dto/hsn-code-response.dto';

@ApiTags('hsn-codes')
@Controller('hsn-codes')
export class HsnCodesController {
  constructor(private readonly hsnCodesService: HsnCodesService) {}

  @RequirePermissions('hsn_codes.view')
  @Get()
  async list(): Promise<HsnCodeResponseDto[]> {
    const items = await this.hsnCodesService.list();
    return items.map((i) => new HsnCodeResponseDto(i));
  }

  @RequirePermissions('hsn_codes.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<HsnCodeResponseDto> {
    return new HsnCodeResponseDto(await this.hsnCodesService.getById(id));
  }

  @RequirePermissions('hsn_codes.create')
  @Post()
  async create(@Body() dto: CreateHsnCodeDto): Promise<HsnCodeResponseDto> {
    return new HsnCodeResponseDto(await this.hsnCodesService.create(dto));
  }

  @RequirePermissions('hsn_codes.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateHsnCodeDto): Promise<HsnCodeResponseDto> {
    return new HsnCodeResponseDto(await this.hsnCodesService.update(id, dto));
  }

  @RequirePermissions('hsn_codes.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.hsnCodesService.remove(id);
  }
}
