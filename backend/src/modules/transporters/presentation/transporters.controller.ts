import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { TransportersService } from '../application/transporters.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { UpdateTransporterDto } from './dto/update-transporter.dto';
import { TransporterResponseDto } from './dto/transporter-response.dto';

@ApiTags('transporters')
@Controller('transporters')
export class TransportersController {
  constructor(private readonly transportersService: TransportersService) {}

  @RequirePermissions('transporters.view')
  @Get()
  async list(): Promise<TransporterResponseDto[]> {
    const items = await this.transportersService.list();
    return items.map((i) => new TransporterResponseDto(i));
  }

  @RequirePermissions('transporters.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<TransporterResponseDto> {
    return new TransporterResponseDto(await this.transportersService.getById(id));
  }

  @RequirePermissions('transporters.create')
  @Post()
  async create(@Body() dto: CreateTransporterDto): Promise<TransporterResponseDto> {
    return new TransporterResponseDto(await this.transportersService.create(dto));
  }

  @RequirePermissions('transporters.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTransporterDto): Promise<TransporterResponseDto> {
    return new TransporterResponseDto(await this.transportersService.update(id, dto));
  }

  @RequirePermissions('transporters.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.transportersService.remove(id);
  }
}
