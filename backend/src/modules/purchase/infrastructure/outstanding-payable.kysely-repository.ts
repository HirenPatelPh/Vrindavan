import { Injectable } from '@nestjs/common';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { OutstandingPayableFilters, OutstandingPayableRow } from '../domain/outstanding-payable.entity';
import { IOutstandingPayableRepository } from '../domain/outstanding-payable.repository.interface';

@Injectable()
export class OutstandingPayableKyselyRepository implements IOutstandingPayableRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(filters: OutstandingPayableFilters): Promise<OutstandingPayableRow[]> {
    let query = this.tenantDb.getDb().selectFrom('v_outstanding_payables').selectAll();
    if (filters.supplierId) query = query.where('supplier_id', '=', filters.supplierId);
    const rows = await query.execute();

    return rows
      .filter((r) => r.purchase_invoice_id !== null)
      .map(
        (r) =>
          new OutstandingPayableRow(
            r.purchase_invoice_id!,
            r.invoice_number!,
            r.invoice_date!,
            r.due_date,
            r.supplier_id!,
            r.supplier_name!,
            Number(r.total_amount),
            Number(r.paid_amount),
            Number(r.outstanding_amount),
            Number(r.days_overdue),
          ),
      );
  }
}
