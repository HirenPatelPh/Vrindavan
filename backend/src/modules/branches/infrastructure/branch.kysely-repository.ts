import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Branches } from '../../../infrastructure/database/kysely/db.types';
import { Branch, CreateBranchProps, UpdateBranchProps } from '../domain/branch.entity';
import { IBranchRepository } from '../domain/branch.repository.interface';

type Row = Selectable<Branches>;

function toDomain(row: Row): Branch {
  return new Branch(
    row.id,
    row.name,
    row.code,
    row.is_head_office,
    row.address_line1,
    row.address_line2,
    row.city,
    row.state,
    row.country,
    row.pincode,
    row.phone,
    row.email,
    row.is_active,
    row.created_at,
    row.updated_at,
  );
}

@Injectable()
export class BranchKyselyRepository implements IBranchRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Branch[]> {
    const rows = await this.tenantDb.getDb().selectFrom('branches').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Branch | null> {
    const row = await this.tenantDb.getDb().selectFrom('branches').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateBranchProps): Promise<Branch> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('branches')
      .values({
        name: props.name,
        code: props.code,
        is_head_office: props.isHeadOffice ?? false,
        address_line1: props.addressLine1 ?? null,
        address_line2: props.addressLine2 ?? null,
        city: props.city ?? null,
        state: props.state ?? null,
        country: props.country ?? null,
        pincode: props.pincode ?? null,
        phone: props.phone ?? null,
        email: props.email ?? null,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateBranchProps): Promise<Branch | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('branches')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.isHeadOffice !== undefined ? { is_head_office: props.isHeadOffice } : {}),
        ...(props.addressLine1 !== undefined ? { address_line1: props.addressLine1 } : {}),
        ...(props.addressLine2 !== undefined ? { address_line2: props.addressLine2 } : {}),
        ...(props.city !== undefined ? { city: props.city } : {}),
        ...(props.state !== undefined ? { state: props.state } : {}),
        ...(props.country !== undefined ? { country: props.country } : {}),
        ...(props.pincode !== undefined ? { pincode: props.pincode } : {}),
        ...(props.phone !== undefined ? { phone: props.phone } : {}),
        ...(props.email !== undefined ? { email: props.email } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('branches').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
