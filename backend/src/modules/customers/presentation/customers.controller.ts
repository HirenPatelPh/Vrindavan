import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CustomersService } from '../application/customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @RequirePermissions('customers.view')
  @Get()
  async list(): Promise<CustomerResponseDto[]> {
    const items = await this.customersService.list();
    return items.map((i) => new CustomerResponseDto(i));
  }

  @RequirePermissions('customers.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<CustomerResponseDto> {
    return new CustomerResponseDto(await this.customersService.getById(id));
  }

  @RequirePermissions('customers.create')
  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return new CustomerResponseDto(await this.customersService.create(dto));
  }

  @RequirePermissions('customers.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    return new CustomerResponseDto(await this.customersService.update(id, dto));
  }

  @RequirePermissions('customers.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.customersService.remove(id);
  }
}
