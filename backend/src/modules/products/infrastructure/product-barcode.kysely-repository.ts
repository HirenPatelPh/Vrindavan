import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { ProductBarcodes } from '../../../infrastructure/database/kysely/db.types';
import { BarcodeType, ProductBarcode, CreateProductBarcodeProps } from '../domain/product-barcode.entity';
import { IProductBarcodeRepository } from '../domain/product-barcode.repository.interface';

type Row = Selectable<ProductBarcodes>;

function toDomain(row: Row): ProductBarcode {
  return new ProductBarcode(
    row.id,
    row.product_id,
    row.product_unit_id,
    row.barcode,
    row.barcode_type as BarcodeType,
    row.is_primary,
    row.created_at,
  );
}

@Injectable()
export class ProductBarcodeKyselyRepository implements IProductBarcodeRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAllByProduct(productId: string): Promise<ProductBarcode[]> {
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('product_barcodes')
      .selectAll()
      .where('product_id', '=', productId)
      .execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<ProductBarcode | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('product_barcodes')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async findByBarcode(barcode: string): Promise<ProductBarcode | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('product_barcodes')
      .selectAll()
      .where('barcode', '=', barcode)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateProductBarcodeProps): Promise<ProductBarcode> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('product_barcodes')
      .values({
        product_id: props.productId,
        product_unit_id: props.productUnitId ?? null,
        barcode: props.barcode,
        barcode_type: props.barcodeType ?? 'ean13',
        is_primary: props.isPrimary ?? false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('product_barcodes').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
