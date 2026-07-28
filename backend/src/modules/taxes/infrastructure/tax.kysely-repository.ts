import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Taxes } from '../../../infrastructure/database/kysely/db.types';
import { Tax, CreateTaxProps, TaxType, UpdateTaxProps } from '../domain/tax.entity';
import { ITaxRepository } from '../domain/tax.repository.interface';

type Row = Selectable<Taxes>;

function toDomain(row: Row): Tax {
  return new Tax(row.id, row.name, row.tax_type as TaxType, Number(row.rate), row.is_active);
}

@Injectable()
export class TaxKyselyRepository implements ITaxRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Tax[]> {
    const rows = await this.tenantDb.getDb().selectFrom('taxes').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Tax | null> {
    const row = await this.tenantDb.getDb().selectFrom('taxes').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateTaxProps): Promise<Tax> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('taxes')
      .values({ name: props.name, tax_type: props.taxType, rate: props.rate, is_active: props.isActive ?? true })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateTaxProps): Promise<Tax | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('taxes')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.taxType !== undefined ? { tax_type: props.taxType } : {}),
        ...(props.rate !== undefined ? { rate: props.rate } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('taxes').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
