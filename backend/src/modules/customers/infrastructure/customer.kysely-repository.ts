import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Customers } from '../../../infrastructure/database/kysely/db.types';
import { Customer, CreateCustomerProps, UpdateCustomerProps } from '../domain/customer.entity';
import { ICustomerRepository } from '../domain/customer.repository.interface';

type Row = Selectable<Customers>;

function toDomain(row: Row): Customer {
  return new Customer(
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
    Number(row.credit_limit),
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
export class CustomerKyselyRepository implements ICustomerRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Customer[]> {
    const rows = await this.tenantDb.getDb().selectFrom('customers').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.tenantDb.getDb().selectFrom('customers').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateCustomerProps): Promise<Customer> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('customers')
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
        credit_limit: props.creditLimit ?? 0,
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

  async update(id: string, props: UpdateCustomerProps): Promise<Customer | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('customers')
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
        ...(props.creditLimit !== undefined ? { credit_limit: props.creditLimit } : {}),
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
    const result = await this.tenantDb.getDb().deleteFrom('customers').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
