import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { StockTransferLines, StockTransfers } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateStockTransferProps,
  StockTransfer,
  StockTransferLine,
  StockTransferStatus,
} from '../domain/stock-transfer.entity';
import { IStockTransferRepository } from '../domain/stock-transfer.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';
import { nextDocumentNumber } from './document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from './stock-posting.helper';

type HeaderRow = Selectable<StockTransfers>;
type LineRow = Selectable<StockTransferLines>;

function toLineDomain(row: LineRow): StockTransferLine {
  return new StockTransferLine(
    row.id,
    row.transfer_id,
    row.product_id,
    row.batch_id,
    row.from_rack_id,
    row.from_location_id,
    row.to_rack_id,
    row.to_location_id,
    Number(row.quantity),
  );
}

function toDomain(header: HeaderRow, lines: StockTransferLine[]): StockTransfer {
  return new StockTransfer(
    header.id,
    header.transfer_number,
    header.transfer_date,
    header.from_warehouse_id,
    header.to_warehouse_id,
    header.status as StockTransferStatus,
    header.remarks,
    header.created_by,
    header.approved_by,
    header.approved_at,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class StockTransferKyselyRepository implements IStockTransferRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, transferId: string): Promise<StockTransferLine[]> {
    const rows = await executor
      .selectFrom('stock_transfer_lines')
      .selectAll()
      .where('transfer_id', '=', transferId)
      .execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<StockTransfer[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('stock_transfers').selectAll().orderBy('transfer_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<StockTransfer | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('stock_transfers').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateStockTransferProps, createdBy?: string): Promise<StockTransfer> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const transferNumber = await nextDocumentNumber(trx, 'stock_transfer', 'TRF');
      const header = await trx
        .insertInto('stock_transfers')
        .values({
          transfer_number: transferNumber,
          ...(props.transferDate ? { transfer_date: props.transferDate } : {}),
          from_warehouse_id: props.fromWarehouseId,
          to_warehouse_id: props.toWarehouseId,
          remarks: props.remarks ?? null,
          status: 'draft',
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: StockTransferLine[] = [];
      for (const line of props.lines) {
        const lineRow = await trx
          .insertInto('stock_transfer_lines')
          .values({
            transfer_id: header.id,
            product_id: line.productId,
            batch_id: line.batchId ?? null,
            from_rack_id: line.fromRackId ?? null,
            from_location_id: line.fromLocationId ?? null,
            to_rack_id: line.toRackId ?? null,
            to_location_id: line.toLocationId ?? null,
            quantity: line.quantity,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async approve(id: string, approvedBy?: string): Promise<StockTransfer> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('stock_transfers').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Stock transfer ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Stock transfer ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('stock_transfer_lines').selectAll().where('transfer_id', '=', id).execute();

      for (const line of lineRows) {
        const sourceBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.from_warehouse_id,
          rackId: line.from_rack_id,
          locationId: line.from_location_id,
          batchId: line.batch_id,
        });
        const unitCost = sourceBalance?.averageCost ?? 0;
        const quantity = Number(line.quantity);

        // Insufficient-source-stock is guarded centrally in postStockMovement (below), which
        // throws InsufficientStockError before writing the ledger — so a transfer that would
        // drive the source warehouse negative fails with a clear message, not a raw DB error.
        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.from_warehouse_id,
          rackId: line.from_rack_id,
          locationId: line.from_location_id,
          batchId: line.batch_id,
          movementType: 'transfer_out',
          qtyOut: quantity,
          unitCost,
          referenceType: 'stock_transfer',
          referenceId: header.id,
          referenceLineId: line.id,
        });
        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.to_warehouse_id,
          rackId: line.to_rack_id,
          locationId: line.to_location_id,
          batchId: line.batch_id,
          movementType: 'transfer_in',
          qtyIn: quantity,
          unitCost,
          referenceType: 'stock_transfer',
          referenceId: header.id,
          referenceLineId: line.id,
        });
      }

      const updatedHeader = await trx
        .updateTable('stock_transfers')
        .set({
          status: 'completed',
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
      .deleteFrom('stock_transfers')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
