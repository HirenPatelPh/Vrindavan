import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Suppliers } from '../../../infrastructure/database/kysely/db.types';
import { Supplier, CreateSupplierProps, UpdateSupplierProps } from '../domain/supplier.entity';
import { ISupplierRepository } from '../domain/supplier.repository.interface';

type Row = Selectable<Suppliers>;

function toDomain(row: Row): Supplier {
  return new Supplier(
    row.id,
    row.name,
    row.code,
    row.contact_person,
    row.email,
    row.phone,
    row.gstin,
    row.pan,
    row.address_line1,
    row.address_line2,
    row.city,
    row.state,
    row.country,
    row.pincode,
    row.credit_period_days,
    Number(row.opening_balance),
    row.is_blocked,
    row.blocked_reason,
    row.is_active,
    row.created_at,
    row.updated_at,
  );
}

@Injectable()
export class SupplierKyselyRepository implements ISupplierRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Supplier[]> {
    const rows = await this.tenantDb.getDb().selectFrom('suppliers').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Supplier | null> {
    const row = await this.tenantDb.getDb().selectFrom('suppliers').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateSupplierProps): Promise<Supplier> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('suppliers')
      .values({
        name: props.name,
        code: props.code,
        contact_person: props.contactPerson ?? null,
        email: props.email ?? null,
        phone: props.phone ?? null,
        gstin: props.gstin ?? null,
        pan: props.pan ?? null,
        address_line1: props.addressLine1 ?? null,
        address_line2: props.addressLine2 ?? null,
        city: props.city ?? null,
        state: props.state ?? null,
        country: props.country ?? null,
        pincode: props.pincode ?? null,
        credit_period_days: props.creditPeriodDays ?? 0,
        opening_balance: props.openingBalance ?? 0,
        is_blocked: props.isBlocked ?? false,
        blocked_reason: props.blockedReason ?? null,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateSupplierProps): Promise<Supplier | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('suppliers')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.code !== undefined ? { code: props.code } : {}),
        ...(props.contactPerson !== undefined ? { contact_person: props.contactPerson } : {}),
        ...(props.email !== undefined ? { email: props.email } : {}),
        ...(props.phone !== undefined ? { phone: props.phone } : {}),
        ...(props.gstin !== undefined ? { gstin: props.gstin } : {}),
        ...(props.pan !== undefined ? { pan: props.pan } : {}),
        ...(props.addressLine1 !== undefined ? { address_line1: props.addressLine1 } : {}),
        ...(props.addressLine2 !== undefined ? { address_line2: props.addressLine2 } : {}),
        ...(props.city !== undefined ? { city: props.city } : {}),
        ...(props.state !== undefined ? { state: props.state } : {}),
        ...(props.country !== undefined ? { country: props.country } : {}),
        ...(props.pincode !== undefined ? { pincode: props.pincode } : {}),
        ...(props.creditPeriodDays !== undefined ? { credit_period_days: props.creditPeriodDays } : {}),
        ...(props.openingBalance !== undefined ? { opening_balance: props.openingBalance } : {}),
        ...(props.isBlocked !== undefined ? { is_blocked: props.isBlocked } : {}),
        ...(props.blockedReason !== undefined ? { blocked_reason: props.blockedReason } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('suppliers').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
