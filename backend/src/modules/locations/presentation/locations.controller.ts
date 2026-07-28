import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { LocationsService } from '../application/locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponseDto } from './dto/location-response.dto';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @RequirePermissions('locations.view')
  @Get()
  async list(): Promise<LocationResponseDto[]> {
    const items = await this.locationsService.list();
    return items.map((i) => new LocationResponseDto(i));
  }

  @RequirePermissions('locations.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<LocationResponseDto> {
    return new LocationResponseDto(await this.locationsService.getById(id));
  }

  @RequirePermissions('locations.create')
  @Post()
  async create(@Body() dto: CreateLocationDto): Promise<LocationResponseDto> {
    return new LocationResponseDto(await this.locationsService.create(dto));
  }

  @RequirePermissions('locations.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateLocationDto): Promise<LocationResponseDto> {
    return new LocationResponseDto(await this.locationsService.update(id, dto));
  }

  @RequirePermissions('locations.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.locationsService.remove(id);
  }
}
