import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { SubCategories } from '../../../infrastructure/database/kysely/db.types';
import { SubCategory, CreateSubCategoryProps, UpdateSubCategoryProps } from '../domain/sub-category.entity';
import { ISubCategoryRepository } from '../domain/sub-category.repository.interface';

type Row = Selectable<SubCategories>;

function toDomain(row: Row): SubCategory {
  return new SubCategory(row.id, row.category_id, row.name, row.code, row.is_active, row.created_at, row.updated_at);
}

@Injectable()
export class SubCategoryKyselyRepository implements ISubCategoryRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<SubCategory[]> {
    const rows = await this.tenantDb.getDb().selectFrom('sub_categories').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<SubCategory | null> {
    const row = await this.tenantDb.getDb().selectFrom('sub_categories').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateSubCategoryProps): Promise<SubCategory> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('sub_categories')
      .values({ category_id: props.categoryId, name: props.name, code: props.code, is_active: props.isActive ?? true })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateSubCategoryProps): Promise<SubCategory | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('sub_categories')
      .set({
        ...(props.categoryId !== undefined ? { category_id: props.categoryId } : {}),
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
    const result = await this.tenantDb.getDb().deleteFrom('sub_categories').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
