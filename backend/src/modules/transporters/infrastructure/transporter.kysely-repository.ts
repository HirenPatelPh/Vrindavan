import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Transporters } from '../../../infrastructure/database/kysely/db.types';
import { Transporter, CreateTransporterProps, UpdateTransporterProps } from '../domain/transporter.entity';
import { ITransporterRepository } from '../domain/transporter.repository.interface';

type Row = Selectable<Transporters>;

function toDomain(row: Row): Transporter {
  return new Transporter(
    row.id,
    row.name,
    row.code,
    row.contact_person,
    row.phone,
    row.vehicle_number,
    row.gst_number,
    row.is_active,
    row.created_at,
    row.updated_at,
  );
}

@Injectable()
export class TransporterKyselyRepository implements ITransporterRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Transporter[]> {
    const rows = await this.tenantDb.getDb().selectFrom('transporters').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Transporter | null> {
    const row = await this.tenantDb.getDb().selectFrom('transporters').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateTransporterProps): Promise<Transporter> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('transporters')
      .values({
        name: props.name,
        code: props.code,
        contact_person: props.contactPerson ?? null,
        phone: props.phone ?? null,
        vehicle_number: props.vehicleNumber ?? null,
        gst_number: props.gstNumber ?? null,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateTransporterProps): Promise<Transporter | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('transporters')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.contactPerson !== undefined ? { contact_person: props.contactPerson } : {}),
        ...(props.phone !== undefined ? { phone: props.phone } : {}),
        ...(props.vehicleNumber !== undefined ? { vehicle_number: props.vehicleNumber } : {}),
        ...(props.gstNumber !== undefined ? { gst_number: props.gstNumber } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('transporters').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
