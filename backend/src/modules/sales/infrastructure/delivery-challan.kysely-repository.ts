import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { DeliveryChallanLines, DeliveryChallans } from '../../../infrastructure/database/kysely/db.types';
import {
  CreateDeliveryChallanProps,
  DeliveryChallan,
  DeliveryChallanLine,
  DeliveryChallanStatus,
} from '../domain/delivery-challan.entity';
import { IDeliveryChallanRepository } from '../domain/delivery-challan.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/sales-document.errors';
import { nextDocumentNumber } from '../../inventory/infrastructure/document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from '../../inventory/infrastructure/stock-posting.helper';

type HeaderRow = Selectable<DeliveryChallans>;
type LineRow = Selectable<DeliveryChallanLines>;

function toLineDomain(row: LineRow): DeliveryChallanLine {
  return new DeliveryChallanLine(
    row.id,
    row.dc_id,
    row.so_line_id,
    row.product_id,
    row.product_unit_id,
    row.batch_id,
    Number(row.quantity),
    row.remarks,
  );
}

function toDomain(header: HeaderRow, lines: DeliveryChallanLine[]): DeliveryChallan {
  return new DeliveryChallan(
    header.id,
    header.dc_number,
    header.dc_date,
    header.so_id,
    header.customer_id,
    header.warehouse_id,
    header.transporter_id,
    header.status as DeliveryChallanStatus,
    header.remarks,
    header.created_by,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class DeliveryChallanKyselyRepository implements IDeliveryChallanRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, dcId: string): Promise<DeliveryChallanLine[]> {
    const rows = await executor.selectFrom('delivery_challan_lines').selectAll().where('dc_id', '=', dcId).execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<DeliveryChallan[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('delivery_challans').selectAll().orderBy('dc_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<DeliveryChallan | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('delivery_challans').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreateDeliveryChallanProps, createdBy?: string): Promise<DeliveryChallan> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const dcNumber = await nextDocumentNumber(trx, 'delivery_challan', 'DC');

      const header = await trx
        .insertInto('delivery_challans')
        .values({
          dc_number: dcNumber,
          ...(props.dcDate ? { dc_date: props.dcDate } : {}),
          so_id: props.soId ?? null,
          customer_id: props.customerId,
          warehouse_id: props.warehouseId,
          transporter_id: props.transporterId ?? null,
          remarks: props.remarks ?? null,
          status: 'draft',
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: DeliveryChallanLine[] = [];
      for (const line of props.lines) {
        const lineRow = await trx
          .insertInto('delivery_challan_lines')
          .values({
            dc_id: header.id,
            so_line_id: line.soLineId ?? null,
            product_id: line.productId,
            product_unit_id: line.productUnitId,
            batch_id: line.batchId ?? null,
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

  async deliver(id: string): Promise<DeliveryChallan> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('delivery_challans').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Delivery challan ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Delivery challan ${id} is not in draft status`);

      const lineRows = await trx.selectFrom('delivery_challan_lines').selectAll().where('dc_id', '=', id).execute();

      for (const line of lineRows) {
        const productUnit = await trx
          .selectFrom('product_units')
          .select('conversion_factor')
          .where('id', '=', line.product_unit_id)
          .executeTakeFirstOrThrow();
        const conversionFactor = Number(productUnit.conversion_factor);
        const quantity = Number(line.quantity);
        const baseQty = quantity * conversionFactor;

        const liveBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          batchId: line.batch_id,
        });

        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          batchId: line.batch_id,
          movementType: 'sales_out',
          qtyOut: baseQty,
          unitCost: liveBalance?.averageCost ?? 0,
          referenceType: 'delivery_challan',
          referenceId: header.id,
          referenceLineId: line.id,
        });

        if (line.so_line_id) {
          await trx
            .updateTable('sales_order_lines')
            .set((eb) => ({ delivered_quantity: eb('delivered_quantity', '+', quantity.toString()) }))
            .where('id', '=', line.so_line_id)
            .execute();
        }
      }

      const updatedHeader = await trx
        .updateTable('delivery_challans')
        .set({ status: 'delivered', updated_at: new Date().toISOString() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (header.so_id) {
        const soLines = await trx
          .selectFrom('sales_order_lines')
          .select(['quantity', 'delivered_quantity'])
          .where('so_id', '=', header.so_id)
          .execute();
        const allDelivered = soLines.every((l) => Number(l.delivered_quantity) >= Number(l.quantity));
        const anyDelivered = soLines.some((l) => Number(l.delivered_quantity) > 0);
        const newSoStatus = allDelivered ? 'completed' : anyDelivered ? 'partially_delivered' : null;

        if (newSoStatus) {
          await trx
            .updateTable('sales_orders')
            .set({ status: newSoStatus, updated_at: new Date().toISOString() })
            .where('id', '=', header.so_id)
            .where('status', 'in', ['approved', 'partially_delivered'])
            .execute();
        }
      }

      return toDomain(updatedHeader, lineRows.map(toLineDomain));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('delivery_challans')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
