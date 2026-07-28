import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { UnitsService } from '../application/units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitResponseDto } from './dto/unit-response.dto';

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @RequirePermissions('units.view')
  @Get()
  async list(): Promise<UnitResponseDto[]> {
    const units = await this.unitsService.list();
    return units.map((u) => new UnitResponseDto(u));
  }

  @RequirePermissions('units.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<UnitResponseDto> {
    const unit = await this.unitsService.getById(id);
    return new UnitResponseDto(unit);
  }

  @RequirePermissions('units.create')
  @Post()
  async create(@Body() dto: CreateUnitDto): Promise<UnitResponseDto> {
    const unit = await this.unitsService.create(dto);
    return new UnitResponseDto(unit);
  }

  @RequirePermissions('units.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUnitDto): Promise<UnitResponseDto> {
    const unit = await this.unitsService.update(id, dto);
    return new UnitResponseDto(unit);
  }

  @RequirePermissions('units.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.unitsService.remove(id);
  }
}
