import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { PurchaseReturnLines, PurchaseReturns } from '../../../infrastructure/database/kysely/db.types';
import {
  CreatePurchaseReturnProps,
  PurchaseReturn,
  PurchaseReturnLine,
  PurchaseReturnStatus,
} from '../domain/purchase-return.entity';
import { IPurchaseReturnRepository } from '../domain/purchase-return.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/purchase-document.errors';
import { nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<PurchaseReturns>;
type LineRow = Selectable<PurchaseReturnLines>;

function toLineDomain(row: LineRow): PurchaseReturnLine {
  return new PurchaseReturnLine(
    row.id,
    row.return_id,
    row.product_id,
    row.batch_id,
    Number(row.quantity),
    Number(row.rate),
    Number(row.line_total),
  );
}

function toDomain(header: HeaderRow, lines: PurchaseReturnLine[]): PurchaseReturn {
  return new PurchaseReturn(
    header.id,
    header.return_number,
    header.return_date,
    header.supplier_id,
    header.purchase_invoice_id,
    header.warehouse_id,
    header.reason,
    header.status as PurchaseReturnStatus,
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
export class PurchaseReturnKyselyRepository implements IPurchaseReturnRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, returnId: string): Promise<PurchaseReturnLine[]> {
    const rows = await executor.selectFrom('purchase_return_lines').selectAll().where('return_id', '=', returnId).execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<PurchaseReturn[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('purchase_returns').selectAll().orderBy('return_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<PurchaseReturn | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('purchase_returns').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreatePurchaseReturnProps, createdBy?: string): Promise<PurchaseReturn> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const returnNumber = await nextDocumentNumber(trx, 'purchase_return', 'PRET');
      const totalAmount = props.lines.reduce((sum, l) => sum + l.quantity * l.rate, 0);

      const header = await trx
        .insertInto('purchase_returns')
        .values({
          return_number: returnNumber,
          ...(props.returnDate ? { return_date: props.returnDate } : {}),
          supplier_id: props.supplierId,
          purchase_invoice_id: props.purchaseInvoiceId ?? null,
          warehouse_id: props.warehouseId,
          reason: props.reason ?? null,
          status: 'draft',
          total_amount: totalAmount,
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: PurchaseReturnLine[] = [];
      for (const line of props.lines) {
        const lineRow = await trx
          .insertInto('purchase_return_lines')
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

  async approve(id: string, approvedBy?: string): Promise<PurchaseReturn> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('purchase_returns').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Purchase return ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Purchase return ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('purchase_return_lines').selectAll().where('return_id', '=', id).execute();

      for (const line of lineRows) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          batchId: line.batch_id,
        });
        const unitCost = liveBalance?.averageCost ?? Number(line.rate);

        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          batchId: line.batch_id,
          movementType: 'return_out',
          qtyOut: Number(line.quantity),
          unitCost,
          referenceType: 'purchase_return',
          referenceId: header.id,
          referenceLineId: line.id,
        });
      }

      const updatedHeader = await trx
        .updateTable('purchase_returns')
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
      .deleteFrom('purchase_returns')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
