import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Locations } from '../../../infrastructure/database/kysely/db.types';
import { Location, CreateLocationProps, UpdateLocationProps } from '../domain/location.entity';
import { ILocationRepository } from '../domain/location.repository.interface';

type Row = Selectable<Locations>;

function toDomain(row: Row): Location {
  return new Location(row.id, row.rack_id, row.name, row.code, row.is_active, row.created_at, row.updated_at);
}

@Injectable()
export class LocationKyselyRepository implements ILocationRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Location[]> {
    const rows = await this.tenantDb.getDb().selectFrom('locations').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Location | null> {
    const row = await this.tenantDb.getDb().selectFrom('locations').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateLocationProps): Promise<Location> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('locations')
      .values({ rack_id: props.rackId, name: props.name, code: props.code, is_active: props.isActive ?? true })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateLocationProps): Promise<Location | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('locations')
      .set({
        ...(props.rackId !== undefined ? { rack_id: props.rackId } : {}),
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
    const result = await this.tenantDb.getDb().deleteFrom('locations').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
