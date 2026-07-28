import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { BranchesService } from '../application/branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchResponseDto } from './dto/branch-response.dto';

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @RequirePermissions('branches.view')
  @Get()
  async list(): Promise<BranchResponseDto[]> {
    const items = await this.branchesService.list();
    return items.map((i) => new BranchResponseDto(i));
  }

  @RequirePermissions('branches.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<BranchResponseDto> {
    return new BranchResponseDto(await this.branchesService.getById(id));
  }

  @RequirePermissions('branches.create')
  @Post()
  async create(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    return new BranchResponseDto(await this.branchesService.create(dto));
  }

  @RequirePermissions('branches.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto): Promise<BranchResponseDto> {
    return new BranchResponseDto(await this.branchesService.update(id, dto));
  }

  @RequirePermissions('branches.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.branchesService.remove(id);
  }
}
