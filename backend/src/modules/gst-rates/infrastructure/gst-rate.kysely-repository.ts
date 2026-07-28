import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { GstRates } from '../../../infrastructure/database/kysely/db.types';
import { GstRate, CreateGstRateProps, UpdateGstRateProps } from '../domain/gst-rate.entity';
import { IGstRateRepository } from '../domain/gst-rate.repository.interface';

type Row = Selectable<GstRates>;

function toDomain(row: Row): GstRate {
  return new GstRate(
    row.id,
    row.name,
    Number(row.total_rate),
    Number(row.cgst_rate),
    Number(row.sgst_rate),
    Number(row.igst_rate),
    row.is_active,
  );
}

@Injectable()
export class GstRateKyselyRepository implements IGstRateRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<GstRate[]> {
    const rows = await this.tenantDb.getDb().selectFrom('gst_rates').selectAll().orderBy('total_rate').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<GstRate | null> {
    const row = await this.tenantDb.getDb().selectFrom('gst_rates').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateGstRateProps): Promise<GstRate> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('gst_rates')
      .values({
        name: props.name,
        total_rate: props.totalRate,
        cgst_rate: props.cgstRate,
        sgst_rate: props.sgstRate,
        igst_rate: props.igstRate,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateGstRateProps): Promise<GstRate | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('gst_rates')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.totalRate !== undefined ? { total_rate: props.totalRate } : {}),
        ...(props.cgstRate !== undefined ? { cgst_rate: props.cgstRate } : {}),
        ...(props.sgstRate !== undefined ? { sgst_rate: props.sgstRate } : {}),
        ...(props.igstRate !== undefined ? { igst_rate: props.igstRate } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('gst_rates').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
