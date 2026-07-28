import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Warehouses } from '../../../infrastructure/database/kysely/db.types';
import { Warehouse, CreateWarehouseProps, UpdateWarehouseProps } from '../domain/warehouse.entity';
import { IWarehouseRepository } from '../domain/warehouse.repository.interface';

type Row = Selectable<Warehouses>;

function toDomain(row: Row): Warehouse {
  return new Warehouse(
    row.id,
    row.branch_id,
    row.name,
    row.code,
    row.address_line1,
    row.city,
    row.state,
    row.pincode,
    row.manager_id,
    row.is_active,
    row.created_at,
    row.updated_at,
  );
}

@Injectable()
export class WarehouseKyselyRepository implements IWarehouseRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Warehouse[]> {
    const rows = await this.tenantDb.getDb().selectFrom('warehouses').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Warehouse | null> {
    const row = await this.tenantDb.getDb().selectFrom('warehouses').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateWarehouseProps): Promise<Warehouse> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('warehouses')
      .values({
        branch_id: props.branchId,
        name: props.name,
        code: props.code,
        address_line1: props.addressLine1 ?? null,
        city: props.city ?? null,
        state: props.state ?? null,
        pincode: props.pincode ?? null,
        manager_id: props.managerId ?? null,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateWarehouseProps): Promise<Warehouse | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('warehouses')
      .set({
        ...(props.branchId !== undefined ? { branch_id: props.branchId } : {}),
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.addressLine1 !== undefined ? { address_line1: props.addressLine1 } : {}),
        ...(props.city !== undefined ? { city: props.city } : {}),
        ...(props.state !== undefined ? { state: props.state } : {}),
        ...(props.pincode !== undefined ? { pincode: props.pincode } : {}),
        ...(props.managerId !== undefined ? { manager_id: props.managerId } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('warehouses').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
