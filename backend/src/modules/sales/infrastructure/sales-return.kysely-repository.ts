import { Inject, Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { SalesReturnLines, SalesReturns } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateSalesReturnProps,
  SalesReturn,
  SalesReturnLine,
  SalesReturnStatus,
} from '../domain/sales-return.entity';
import { ISalesReturnRepository } from '../domain/sales-return.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';
import { nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from '../../inventory/infrastructure/stock-posting.helper';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../products/domain/product.repository.interface';

type HeaderRow = Selectable<SalesReturns>;
type LineRow = Selectable<SalesReturnLines>;

function toLineDomain(row: LineRow): SalesReturnLine {
  return new SalesReturnLine(
    row.id,
    row.return_id,
    row.product_id,
    row.batch_id,
    Number(row.quantity),
    Number(row.rate),
    Number(row.line_total),
  );
}

function toDomain(header: HeaderRow, lines: SalesReturnLine[]): SalesReturn {
  return new SalesReturn(
    header.id,
    header.return_number,
    header.return_date,
    header.customer_id,
    header.sales_invoice_id,
    header.warehouse_id,
    header.reason,
    header.status as SalesReturnStatus,
    Number(header.total_amount),
    header.created_by,
    header.approved_by,
    header.approved_at,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class SalesReturnKyselyRepository implements ISalesReturnRepository {
  constructor(
    private readonly tenantDb: TenantDbService,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: IProductRepository,
  ) {}

  private async linesFor(executor: Executor, returnId: string): Promise<SalesReturnLine[]> {
    const rows = await executor.selectFrom('sales_return_lines').selectAll().where('return_id', '=', returnId).execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<SalesReturn[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('sales_returns').selectAll().orderBy('return_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<SalesReturn | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('sales_returns').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateSalesReturnProps, createdBy?: string): Promise<SalesReturn> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const returnNumber = await nextDocumentNumber(trx, 'sales_return', 'SRET');
      const totalAmount = props.lines.reduce((sum, l) => sum + l.quantity * l.rate, 0);

      const header = await trx
        .insertInto('sales_returns')
        .values({
          return_number: returnNumber,
          ...(props.returnDate ? { return_date: props.returnDate } : {}),
          customer_id: props.customerId,
          sales_invoice_id: props.salesInvoiceId ?? null,
          warehouse_id: props.warehouseId,
          reason: props.reason ?? null,
          status: 'draft',
          total_amount: totalAmount,
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: SalesReturnLine[] = [];
      for (const line of props.lines) {
        const lineRow = await trx
          .insertInto('sales_return_lines')
          .values({
            return_id: header.id,
            product_id: line.productId,
            batch_id: line.batchId ?? null,
            quantity: line.quantity,
            rate: line.rate,
            line_total: line.quantity * line.rate,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async approve(id: string, approvedBy?: string): Promise<SalesReturn> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('sales_returns').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Sales return ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Sales return ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('sales_return_lines').selectAll().where('return_id', '=', id).execute();

      for (const line of lineRows) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          batchId: line.batch_id,
        });

        let unitCost = liveBalance?.averageCost;
        if (unitCost === undefined) {
          const product = await this.productRepository.findById(line.product_id);
          unitCost = product?.purchasePrice ?? 0;
        }

        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          batchId: line.batch_id,
          movementType: 'return_in',
          qtyIn: Number(line.quantity),
          unitCost,
          referenceType: 'sales_return',
          referenceId: header.id,
          referenceLineId: line.id,
        });
      }

      const updatedHeader = await trx
        .updateTable('sales_returns')
        .set({
          status: 'approved',
          approved_by: approvedBy ?? null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toDomain(updatedHeader, lineRows.map(toLineDomain));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('sales_returns')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
