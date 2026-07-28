import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Employees } from '../../../infrastructure/database/kysely/db.types';
import { Employee, CreateEmployeeProps, UpdateEmployeeProps } from '../domain/employee.entity';
import { IEmployeeRepository } from '../domain/employee.repository.interface';

type Row = Selectable<Employees>;

function toDomain(row: Row): Employee {
  return new Employee(
    row.id,
    row.user_id,
    row.name,
    row.code,
    row.designation,
    row.department,
    row.phone,
    row.email,
    row.joining_date,
    row.is_active,
    row.created_at,
    row.updated_at,
  );
}

@Injectable()
export class EmployeeKyselyRepository implements IEmployeeRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Employee[]> {
    const rows = await this.tenantDb.getDb().selectFrom('employees').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Employee | null> {
    const row = await this.tenantDb.getDb().selectFrom('employees').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateEmployeeProps): Promise<Employee> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('employees')
      .values({
        user_id: props.userId ?? null,
        name: props.name,
        code: props.code,
        designation: props.designation ?? null,
        department: props.department ?? null,
        phone: props.phone ?? null,
        email: props.email ?? null,
        joining_date: props.joiningDate ?? null,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateEmployeeProps): Promise<Employee | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('employees')
      .set({
        ...(props.userId !== undefined ? { user_id: props.userId } : {}),
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.designation !== undefined ? { designation: props.designation } : {}),
        ...(props.department !== undefined ? { department: props.department } : {}),
        ...(props.phone !== undefined ? { phone: props.phone } : {}),
        ...(props.email !== undefined ? { email: props.email } : {}),
        ...(props.joiningDate !== undefined ? { joining_date: props.joiningDate } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('employees').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
