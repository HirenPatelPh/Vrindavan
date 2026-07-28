import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { HsnCodes } from '../../../infrastructure/database/kysely/db.types';
import { HsnCode, CreateHsnCodeProps, UpdateHsnCodeProps } from '../domain/hsn-code.entity';
import { IHsnCodeRepository } from '../domain/hsn-code.repository.interface';

type Row = Selectable<HsnCodes>;

function toDomain(row: Row): HsnCode {
  return new HsnCode(row.id, row.code, row.description, row.default_gst_id, row.is_active);
}

@Injectable()
export class HsnCodeKyselyRepository implements IHsnCodeRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<HsnCode[]> {
    const rows = await this.tenantDb.getDb().selectFrom('hsn_codes').selectAll().orderBy('code').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<HsnCode | null> {
    const row = await this.tenantDb.getDb().selectFrom('hsn_codes').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateHsnCodeProps): Promise<HsnCode> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('hsn_codes')
      .values({
        code: props.code,
        description: props.description ?? null,
        default_gst_id: props.defaultGstId ?? null,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateHsnCodeProps): Promise<HsnCode | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('hsn_codes')
      .set({
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.description !== undefined ? { description: props.description } : {}),
        ...(props.defaultGstId !== undefined ? { default_gst_id: props.defaultGstId } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('hsn_codes').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
