import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { EmployeesService } from '../application/employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @RequirePermissions('employees.view')
  @Get()
  async list(): Promise<EmployeeResponseDto[]> {
    const items = await this.employeesService.list();
    return items.map((i) => new EmployeeResponseDto(i));
  }

  @RequirePermissions('employees.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return new EmployeeResponseDto(await this.employeesService.getById(id));
  }

  @RequirePermissions('employees.create')
  @Post()
  async create(@Body() dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    return new EmployeeResponseDto(await this.employeesService.create(dto));
  }

  @RequirePermissions('employees.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    return new EmployeeResponseDto(await this.employeesService.update(id, dto));
  }

  @RequirePermissions('employees.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.employeesService.remove(id);
  }
}
