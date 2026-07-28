import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Units } from '../../../infrastructure/database/kysely/db.types';
import { CreateUnitProps, Unit, UpdateUnitProps } from '../domain/unit.entity';
import { IUnitRepository } from '../domain/unit.repository.interface';

type UnitRow = Selectable<Units>;

function toDomain(row: UnitRow): Unit {
  return new Unit(row.id, row.name, row.short_code, row.is_active, row.created_at, row.updated_at);
}

@Injectable()
export class UnitKyselyRepository implements IUnitRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Unit[]> {
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('units')
      .selectAll()
      .orderBy('name')
      .execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Unit | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('units')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateUnitProps): Promise<Unit> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('units')
      .values({
        name: props.name,
        short_code: props.shortCode,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateUnitProps): Promise<Unit | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('units')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.shortCode !== undefined ? { short_code: props.shortCode } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('units').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
