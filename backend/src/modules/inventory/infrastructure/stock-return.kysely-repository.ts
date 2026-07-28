import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { StockReturnLines, StockReturns } from '../../../infrastructure/database/kysely/db.types';
import { CreateStockReturnProps, StockReturn, StockReturnLine, StockReturnStatus } from '../domain/stock-return.entity';
import { IStockReturnRepository } from '../domain/stock-return.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';
import { nextDocumentNumber } from './document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from './stock-posting.helper';

type HeaderRow = Selectable<StockReturns>;
type LineRow = Selectable<StockReturnLines>;

function toLineDomain(row: LineRow): StockReturnLine {
  return new StockReturnLine(row.id, row.return_id, row.product_id, row.batch_id, row.rack_id, row.location_id, Number(row.quantity), row.remarks);
}

function toDomain(header: HeaderRow, lines: StockReturnLine[]): StockReturn {
  return new StockReturn(
    header.id,
    header.return_number,
    header.return_date,
    header.warehouse_id,
    header.reason,
    header.status as StockReturnStatus,
    header.created_by,
    header.approved_by,
    header.approved_at,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class StockReturnKyselyRepository implements IStockReturnRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, returnId: string): Promise<StockReturnLine[]> {
    const rows = await executor.selectFrom('stock_return_lines').selectAll().where('return_id', '=', returnId).execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<StockReturn[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('stock_returns').selectAll().orderBy('return_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<StockReturn | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('stock_returns').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateStockReturnProps, createdBy?: string): Promise<StockReturn> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const returnNumber = await nextDocumentNumber(trx, 'stock_return', 'RET');
      const header = await trx
        .insertInto('stock_returns')
        .values({
          return_number: returnNumber,
          ...(props.returnDate ? { return_date: props.returnDate } : {}),
          warehouse_id: props.warehouseId,
          reason: props.reason ?? null,
          status: 'draft',
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: StockReturnLine[] = [];
      for (const line of props.lines) {
        const lineRow = await trx
          .insertInto('stock_return_lines')
          .values({
            return_id: header.id,
            product_id: line.productId,
            batch_id: line.batchId ?? null,
            rack_id: line.rackId ?? null,
            location_id: line.locationId ?? null,
            quantity: line.quantity,
            remarks: line.remarks ?? null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async approve(id: string, approvedBy?: string): Promise<StockReturn> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('stock_returns').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Stock return ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Stock return ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('stock_return_lines').selectAll().where('return_id', '=', id).execute();

      for (const line of lineRows) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
        });

        let unitCost = liveBalance?.averageCost;
        if (unitCost === undefined) {
          const product = await trx
            .selectFrom('products')
            .select('purchase_price')
            .where('id', '=', line.product_id)
            .executeTakeFirst();
          unitCost = product ? Number(product.purchase_price) : 0;
        }

        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
          movementType: 'return_in',
          qtyIn: Number(line.quantity),
          unitCost,
          referenceType: 'stock_return',
          referenceId: header.id,
          referenceLineId: line.id,
        });
      }

      const updatedHeader = await trx
        .updateTable('stock_returns')
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
      .deleteFrom('stock_returns')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
