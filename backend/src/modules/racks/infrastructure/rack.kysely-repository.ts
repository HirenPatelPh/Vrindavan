import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Racks } from '../../../infrastructure/database/kysely/db.types';
import { Rack, CreateRackProps, UpdateRackProps } from '../domain/rack.entity';
import { IRackRepository } from '../domain/rack.repository.interface';

type Row = Selectable<Racks>;

function toDomain(row: Row): Rack {
  return new Rack(row.id, row.warehouse_id, row.name, row.code, row.is_active, row.created_at, row.updated_at);
}

@Injectable()
export class RackKyselyRepository implements IRackRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Rack[]> {
    const rows = await this.tenantDb.getDb().selectFrom('racks').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Rack | null> {
    const row = await this.tenantDb.getDb().selectFrom('racks').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateRackProps): Promise<Rack> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('racks')
      .values({ warehouse_id: props.warehouseId, name: props.name, code: props.code, is_active: props.isActive ?? true })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateRackProps): Promise<Rack | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('racks')
      .set({
        ...(props.warehouseId !== undefined ? { warehouse_id: props.warehouseId } : {}),
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('racks').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
