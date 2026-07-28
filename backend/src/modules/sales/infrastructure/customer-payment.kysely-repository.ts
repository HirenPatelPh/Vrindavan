import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { CustomerPaymentAllocations, CustomerPayments } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateCustomerPaymentProps,
  CustomerPayment,
  CustomerPaymentAllocation,
  PaymentMode,
} from '../domain/customer-payment.entity';
import { ICustomerPaymentRepository } from '../domain/customer-payment.repository.interface';
import { InvalidAllocationError } from '../domain/sales-document.errors';
import { nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<CustomerPayments>;
type AllocationRow = Selectable<CustomerPaymentAllocations>;

function toAllocationDomain(row: AllocationRow): CustomerPaymentAllocation {
  return new CustomerPaymentAllocation(row.id, row.payment_id, row.sales_invoice_id, Number(row.allocated_amount));
}

function toDomain(header: HeaderRow, allocations: CustomerPaymentAllocation[]): CustomerPayment {
  return new CustomerPayment(
    header.id,
    header.payment_number,
    header.payment_date,
    header.customer_id,
    Number(header.amount),
    header.payment_mode as PaymentMode,
    header.reference_number,
    header.remarks,
    header.created_by,
    header.created_at,
    allocations,
  );
}

@Injectable()
export class CustomerPaymentKyselyRepository implements ICustomerPaymentRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async allocationsFor(executor: Executor, paymentId: string): Promise<CustomerPaymentAllocation[]> {
    const rows = await executor
      .selectFrom('customer_payment_allocations')
      .selectAll()
      .where('payment_id', '=', paymentId)
      .execute();
    return rows.map(toAllocationDomain);
  }

  async findAll(): Promise<CustomerPayment[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('customer_payments').selectAll().orderBy('payment_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.allocationsFor(db, h.id))));
  }

  async findById(id: string): Promise<CustomerPayment | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('customer_payments').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.allocationsFor(db, id));
  }

  async createWithAllocations(props: CreateCustomerPaymentProps, createdBy?: string): Promise<CustomerPayment> {
    const totalAllocated = props.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
    if (totalAllocated > props.amount) {
      throw new InvalidAllocationError(
        `Allocations (${totalAllocated}) exceed the payment amount (${props.amount})`,
      );
    }

    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const paymentNumber = await nextDocumentNumber(trx, 'customer_payment', 'CPAY');

      const header = await trx
        .insertInto('customer_payments')
        .values({
          payment_number: paymentNumber,
          ...(props.paymentDate ? { payment_date: props.paymentDate } : {}),
          customer_id: props.customerId,
          amount: props.amount,
          payment_mode: props.paymentMode,
          reference_number: props.referenceNumber ?? null,
          remarks: props.remarks ?? null,
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const allocations: CustomerPaymentAllocation[] = [];
      for (const alloc of props.allocations) {
        const invoice = await trx
          .selectFrom('sales_invoices')
          .select(['id', 'customer_id', 'total_amount', 'paid_amount', 'status'])
          .where('id', '=', alloc.salesInvoiceId)
          .forUpdate()
          .executeTakeFirst();

        if (!invoice) {
          throw new InvalidAllocationError(`Sales invoice ${alloc.salesInvoiceId} not found`);
        }
        if (invoice.customer_id !== props.customerId) {
          throw new InvalidAllocationError(
            `Sales invoice ${alloc.salesInvoiceId} does not belong to customer ${props.customerId}`,
          );
        }
        const outstanding = Number(invoice.total_amount) - Number(invoice.paid_amount);
        if (alloc.allocatedAmount > outstanding) {
          throw new InvalidAllocationError(
            `Allocation ${alloc.allocatedAmount} exceeds outstanding balance ${outstanding} on invoice ${alloc.salesInvoiceId}`,
          );
        }

        const allocationRow = await trx
          .insertInto('customer_payment_allocations')
          .values({
            payment_id: header.id,
            sales_invoice_id: alloc.salesInvoiceId,
            allocated_amount: alloc.allocatedAmount,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        allocations.push(toAllocationDomain(allocationRow));

        const newPaidAmount = Number(invoice.paid_amount) + alloc.allocatedAmount;
        const newStatus = newPaidAmount >= Number(invoice.total_amount) ? 'paid' : 'partially_paid';
        const updateResult = await trx
          .updateTable('sales_invoices')
          .set({ paid_amount: newPaidAmount, status: newStatus, updated_at: new Date().toISOString() })
          .where('id', '=', alloc.salesInvoiceId)
          .where('status', 'in', ['approved', 'partially_paid'])
          .executeTakeFirst();
        if ((updateResult.numUpdatedRows ?? 0n) === 0n) {
          throw new InvalidAllocationError(
            `Sales invoice ${alloc.salesInvoiceId} is not in a payable status (must be approved or partially_paid)`,
          );
        }
      }

      return toDomain(header, allocations);
    });
  }
}
