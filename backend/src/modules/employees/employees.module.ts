import { Module } from '@nestjs/common';
import { EmployeesController } from './presentation/employees.controller';
import { EmployeesService } from './application/employees.service';
import { EMPLOYEE_REPOSITORY } from './domain/employee.repository.interface';
import { EmployeeKyselyRepository } from './infrastructure/employee.kysely-repository';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, { provide: EMPLOYEE_REPOSITORY, useClass: EmployeeKyselyRepository }],
  exports: [EMPLOYEE_REPOSITORY],
})
export class EmployeesModule {}
