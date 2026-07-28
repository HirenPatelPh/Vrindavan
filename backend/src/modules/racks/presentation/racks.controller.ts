import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { RacksService } from '../application/racks.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { RackResponseDto } from './dto/rack-response.dto';

@ApiTags('racks')
@Controller('racks')
export class RacksController {
  constructor(private readonly racksService: RacksService) {}

  @RequirePermissions('racks.view')
  @Get()
  async list(): Promise<RackResponseDto[]> {
    const items = await this.racksService.list();
    return items.map((i) => new RackResponseDto(i));
  }

  @RequirePermissions('racks.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<RackResponseDto> {
    return new RackResponseDto(await this.racksService.getById(id));
  }

  @RequirePermissions('racks.create')
  @Post()
  async create(@Body() dto: CreateRackDto): Promise<RackResponseDto> {
    return new RackResponseDto(await this.racksService.create(dto));
  }

  @RequirePermissions('racks.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRackDto): Promise<RackResponseDto> {
    return new RackResponseDto(await this.racksService.update(id, dto));
  }

  @RequirePermissions('racks.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.racksService.remove(id);
  }
}
