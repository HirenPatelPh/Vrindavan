import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { SupplierPaymentAllocations, SupplierPayments } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateSupplierPaymentProps,
  PaymentMode,
  SupplierPayment,
  SupplierPaymentAllocation,
} from '../domain/supplier-payment.entity';
import { ISupplierPaymentRepository } from '../domain/supplier-payment.repository.interface';
import { InvalidAllocationError } from '../domain/purchase-document.errors';
import { nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<SupplierPayments>;
type AllocationRow = Selectable<SupplierPaymentAllocations>;

function toAllocationDomain(row: AllocationRow): SupplierPaymentAllocation {
  return new SupplierPaymentAllocation(row.id, row.payment_id, row.purchase_invoice_id, Number(row.allocated_amount));
}

function toDomain(header: HeaderRow, allocations: SupplierPaymentAllocation[]): SupplierPayment {
  return new SupplierPayment(
    header.id,
    header.payment_number,
    header.payment_date,
    header.supplier_id,
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
export class SupplierPaymentKyselyRepository implements ISupplierPaymentRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async allocationsFor(executor: Executor, paymentId: string): Promise<SupplierPaymentAllocation[]> {
    const rows = await executor
      .selectFrom('supplier_payment_allocations')
      .selectAll()
      .where('payment_id', '=', paymentId)
      .execute();
    return rows.map(toAllocationDomain);
  }

  async findAll(): Promise<SupplierPayment[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('supplier_payments').selectAll().orderBy('payment_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.allocationsFor(db, h.id))));
  }

  async findById(id: string): Promise<SupplierPayment | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('supplier_payments').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.allocationsFor(db, id));
  }

  async createWithAllocations(props: CreateSupplierPaymentProps, createdBy?: string): Promise<SupplierPayment> {
    const totalAllocated = props.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
    if (totalAllocated > props.amount) {
      throw new InvalidAllocationError(
        `Allocations (${totalAllocated}) exceed the payment amount (${props.amount})`,
      );
    }

    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const paymentNumber = await nextDocumentNumber(trx, 'supplier_payment', 'SPAY');

      const header = await trx
        .insertInto('supplier_payments')
        .values({
          payment_number: paymentNumber,
          ...(props.paymentDate ? { payment_date: props.paymentDate } : {}),
          supplier_id: props.supplierId,
          amount: props.amount,
          payment_mode: props.paymentMode,
          reference_number: props.referenceNumber ?? null,
          remarks: props.remarks ?? null,
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const allocations: SupplierPaymentAllocation[] = [];
      for (const alloc of props.allocations) {
        const invoice = await trx
          .selectFrom('purchase_invoices')
          .select(['id', 'supplier_id', 'total_amount', 'paid_amount', 'status'])
          .where('id', '=', alloc.purchaseInvoiceId)
          .forUpdate()
          .executeTakeFirst();

        if (!invoice) {
          throw new InvalidAllocationError(`Purchase invoice ${alloc.purchaseInvoiceId} not found`);
        }
        if (invoice.supplier_id !== props.supplierId) {
          throw new InvalidAllocationError(
            `Purchase invoice ${alloc.purchaseInvoiceId} does not belong to supplier ${props.supplierId}`,
          );
        }
        const outstanding = Number(invoice.total_amount) - Number(invoice.paid_amount);
        if (alloc.allocatedAmount > outstanding) {
          throw new InvalidAllocationError(
            `Allocation ${alloc.allocatedAmount} exceeds outstanding balance ${outstanding} on invoice ${alloc.purchaseInvoiceId}`,
          );
        }

        const allocationRow = await trx
          .insertInto('supplier_payment_allocations')
          .values({
            payment_id: header.id,
            purchase_invoice_id: alloc.purchaseInvoiceId,
            allocated_amount: alloc.allocatedAmount,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        allocations.push(toAllocationDomain(allocationRow));

        const newPaidAmount = Number(invoice.paid_amount) + alloc.allocatedAmount;
        const newStatus = newPaidAmount >= Number(invoice.total_amount) ? 'paid' : 'partially_paid';
        const updateResult = await trx
          .updateTable('purchase_invoices')
          .set({ paid_amount: newPaidAmount, status: newStatus, updated_at: new Date().toISOString() })
          .where('id', '=', alloc.purchaseInvoiceId)
          .where('status', 'in', ['approved', 'partially_paid'])
          .executeTakeFirst();
        if ((updateResult.numUpdatedRows ?? 0n) === 0n) {
          throw new InvalidAllocationError(
            `Purchase invoice ${alloc.purchaseInvoiceId} is not in a payable status (must be approved or partially_paid)`,
          );
        }
      }

      return toDomain(header, allocations);
    });
  }
}
