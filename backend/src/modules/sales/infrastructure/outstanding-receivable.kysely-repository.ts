import { Injectable } from '@nestjs/common';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { OutstandingReceivableFilters, OutstandingReceivableRow } from '../domain/outstanding-receivable.entity';
import { IOutstandingReceivableRepository } from '../domain/outstanding-receivable.repository.interface';

@Injectable()
export class OutstandingReceivableKyselyRepository implements IOutstandingReceivableRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(filters: OutstandingReceivableFilters): Promise<OutstandingReceivableRow[]> {
    let query = this.tenantDb.getDb().selectFrom('v_outstanding_receivables').selectAll();
    if (filters.customerId) query = query.where('customer_id', '=', filters.customerId);
    const rows = await query.execute();

    return rows
      .filter((r) => r.sales_invoice_id !== null)
      .map(
        (r) =>
          new OutstandingReceivableRow(
            r.sales_invoice_id!,
            r.invoice_number!,
            r.invoice_date!,
            r.due_date,
            r.customer_id!,
            r.customer_name!,
            Number(r.total_amount),
            Number(r.paid_amount),
            Number(r.outstanding_amount),
            Number(r.days_overdue),
          ),
      );
  }
}
