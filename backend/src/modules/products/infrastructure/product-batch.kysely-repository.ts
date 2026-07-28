import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { ProductBatches } from '../../../infrastructure/database/kysely/db.types';
import { ProductBatch, CreateProductBatchProps, UpdateProductBatchProps } from '../domain/product-batch.entity';
import { IProductBatchRepository } from '../domain/product-batch.repository.interface';

type Row = Selectable<ProductBatches>;

function toDomain(row: Row): ProductBatch {
  return new ProductBatch(
    row.id,
    row.product_id,
    row.batch_number,
    row.lot_number,
    row.manufacturing_date,
    row.expiry_date,
    row.created_at,
  );
}

@Injectable()
export class ProductBatchKyselyRepository implements IProductBatchRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAllByProduct(productId: string): Promise<ProductBatch[]> {
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('product_batches')
      .selectAll()
      .where('product_id', '=', productId)
      .orderBy('expiry_date')
      .execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<ProductBatch | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('product_batches')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateProductBatchProps): Promise<ProductBatch> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('product_batches')
      .values({
        product_id: props.productId,
        batch_number: props.batchNumber,
        lot_number: props.lotNumber ?? null,
        manufacturing_date: props.manufacturingDate ?? null,
        expiry_date: props.expiryDate ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateProductBatchProps): Promise<ProductBatch | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('product_batches')
      .set({
        ...(props.batchNumber !== undefined ? { batch_number: props.batchNumber } : {}),
        ...(props.lotNumber !== undefined ? { lot_number: props.lotNumber } : {}),
        ...(props.manufacturingDate !== undefined ? { manufacturing_date: props.manufacturingDate } : {}),
        ...(props.expiryDate !== undefined ? { expiry_date: props.expiryDate } : {}),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('product_batches').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
