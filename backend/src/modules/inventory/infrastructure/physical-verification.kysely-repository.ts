import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { PhysicalVerificationLines, PhysicalVerifications } from '../../../infrastructure/database/kysely/db.types';
import {
  CreatePhysicalVerificationProps,
  PhysicalVerification,
  PhysicalVerificationLine,
  PhysicalVerificationStatus,
} from '../domain/physical-verification.entity';
import { IPhysicalVerificationRepository } from '../domain/physical-verification.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/inventory-document.errors';
import { nextDocumentNumber } from './document-numbering.helper';
import { Executor, getLiveBalance, postStockMovement } from './stock-posting.helper';

type HeaderRow = Selectable<PhysicalVerifications>;
type LineRow = Selectable<PhysicalVerificationLines>;

function toLineDomain(row: LineRow): PhysicalVerificationLine {
  return new PhysicalVerificationLine(
    row.id,
    row.verification_id,
    row.product_id,
    row.batch_id,
    row.rack_id,
    row.location_id,
    Number(row.system_quantity),
    Number(row.counted_quantity),
    row.difference === null ? null : Number(row.difference),
    row.remarks,
  );
}

function toDomain(header: HeaderRow, lines: PhysicalVerificationLine[]): PhysicalVerification {
  return new PhysicalVerification(
    header.id,
    header.verification_number,
    header.verification_date,
    header.warehouse_id,
    header.status as PhysicalVerificationStatus,
    header.created_by,
    header.completed_at,
    header.created_at,
    header.updated_at,
    lines,
  );
}

@Injectable()
export class PhysicalVerificationKyselyRepository implements IPhysicalVerificationRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  private async linesFor(executor: Executor, verificationId: string): Promise<PhysicalVerificationLine[]> {
    const rows = await executor
      .selectFrom('physical_verification_lines')
      .selectAll()
      .where('verification_id', '=', verificationId)
      .execute();
    return rows.map(toLineDomain);
  }

  async findAll(): Promise<PhysicalVerification[]> {
    const db = this.tenantDb.getDb();
    const headers = await db.selectFrom('physical_verifications').selectAll().orderBy('verification_date', 'desc').execute();
    return Promise.all(headers.map(async (h) => toDomain(h, await this.linesFor(db, h.id))));
  }

  async findById(id: string): Promise<PhysicalVerification | null> {
    const db = this.tenantDb.getDb();
    const header = await db.selectFrom('physical_verifications').selectAll().where('id', '=', id).executeTakeFirst();
    if (!header) return null;
    return toDomain(header, await this.linesFor(db, id));
  }

  async createWithLines(props: CreatePhysicalVerificationProps, createdBy?: string): Promise<PhysicalVerification> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const verificationNumber = await nextDocumentNumber(trx, 'physical_verification', 'PV');
      const header = await trx
        .insertInto('physical_verifications')
        .values({
          verification_number: verificationNumber,
          ...(props.verificationDate ? { verification_date: props.verificationDate } : {}),
          warehouse_id: props.warehouseId,
          status: 'draft',
          created_by: createdBy ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const lines: PhysicalVerificationLine[] = [];
      for (const line of props.lines) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.productId,
          warehouseId: props.warehouseId,
          rackId: line.rackId,
          locationId: line.locationId,
          batchId: line.batchId,
        });
        const lineRow = await trx
          .insertInto('physical_verification_lines')
          .values({
            verification_id: header.id,
            product_id: line.productId,
            batch_id: line.batchId ?? null,
            rack_id: line.rackId ?? null,
            location_id: line.locationId ?? null,
            system_quantity: liveBalance?.quantity ?? 0,
            counted_quantity: line.countedQuantity,
            remarks: line.remarks ?? null,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        lines.push(toLineDomain(lineRow));
      }
      return toDomain(header, lines);
    });
  }

  async complete(id: string): Promise<PhysicalVerification> {
    return this.tenantDb.getDb().transaction().execute(async (trx) => {
      const header = await trx.selectFrom('physical_verifications').selectAll().where('id', '=', id).executeTakeFirst();
      if (!header) throw new DocumentNotFoundError(`Physical verification ${id} not found`);
      if (header.status !== 'draft') throw new DocumentNotDraftError(`Physical verification ${id} is not in draft status`);

      const lineRows = await trx
        .selectFrom('physical_verification_lines')
        .selectAll()
        .where('verification_id', '=', id)
        .execute();

      for (const line of lineRows) {
        const liveBalance = await getLiveBalance(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
        });
        const liveQuantity = liveBalance?.quantity ?? 0;
        const diff = Number(line.counted_quantity) - liveQuantity;
        if (diff === 0) continue;

        await postStockMovement(trx, {
          productId: line.product_id,
          warehouseId: header.warehouse_id,
          rackId: line.rack_id,
          locationId: line.location_id,
          batchId: line.batch_id,
          movementType: diff > 0 ? 'verification_adjustment_in' : 'verification_adjustment_out',
          qtyIn: diff > 0 ? diff : undefined,
          qtyOut: diff < 0 ? Math.abs(diff) : undefined,
          unitCost: liveBalance?.averageCost ?? 0,
          referenceType: 'physical_verification',
          referenceId: header.id,
          referenceLineId: line.id,
        });
      }

      const updatedHeader = await trx
        .updateTable('physical_verifications')
        .set({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return toDomain(updatedHeader, lineRows.map(toLineDomain));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb
      .getDb()
      .deleteFrom('physical_verifications')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
