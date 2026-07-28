import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Categories } from '../../../infrastructure/database/kysely/db.types';
import { Category, CreateCategoryProps, UpdateCategoryProps } from '../domain/category.entity';
import { ICategoryRepository } from '../domain/category.repository.interface';

type Row = Selectable<Categories>;

function toDomain(row: Row): Category {
  return new Category(row.id, row.name, row.code, row.is_active, row.created_at, row.updated_at);
}

@Injectable()
export class CategoryKyselyRepository implements ICategoryRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Category[]> {
    const rows = await this.tenantDb.getDb().selectFrom('categories').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.tenantDb.getDb().selectFrom('categories').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateCategoryProps): Promise<Category> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('categories')
      .values({ name: props.name, code: props.code, is_active: props.isActive ?? true })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateCategoryProps): Promise<Category | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('categories')
      .set({
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
    const result = await this.tenantDb.getDb().deleteFrom('categories').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
