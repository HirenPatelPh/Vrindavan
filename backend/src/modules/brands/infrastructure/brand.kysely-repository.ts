import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Brands } from '../../../infrastructure/database/kysely/db.types';
import { Brand, CreateBrandProps, UpdateBrandProps } from '../domain/brand.entity';
import { IBrandRepository } from '../domain/brand.repository.interface';

type Row = Selectable<Brands>;

function toDomain(row: Row): Brand {
  return new Brand(row.id, row.name, row.code, row.logo_url, row.is_active, row.created_at, row.updated_at);
}

@Injectable()
export class BrandKyselyRepository implements IBrandRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Brand[]> {
    const rows = await this.tenantDb.getDb().selectFrom('brands').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Brand | null> {
    const row = await this.tenantDb.getDb().selectFrom('brands').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateBrandProps): Promise<Brand> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('brands')
      .values({ name: props.name, code: props.code, logo_url: props.logoUrl ?? null, is_active: props.isActive ?? true })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateBrandProps): Promise<Brand | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('brands')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.logoUrl !== undefined ? { logo_url: props.logoUrl } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('brands').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
