import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { ProductUnits } from '../../../infrastructure/database/kysely/db.types';
import { ProductUnit, CreateProductUnitProps, UpdateProductUnitProps } from '../domain/product-unit.entity';
import { IProductUnitRepository } from '../domain/product-unit.repository.interface';

type Row = Selectable<ProductUnits>;

function toDomain(row: Row): ProductUnit {
  return new ProductUnit(
    row.id,
    row.product_id,
    row.unit_id,
    row.is_base_unit,
    Number(row.conversion_factor),
    row.purchase_price === null ? null : Number(row.purchase_price),
    row.selling_price === null ? null : Number(row.selling_price),
    row.barcode,
    row.created_at,
  );
}

@Injectable()
export class ProductUnitKyselyRepository implements IProductUnitRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAllByProduct(productId: string): Promise<ProductUnit[]> {
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('product_units')
      .selectAll()
      .where('product_id', '=', productId)
      .execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<ProductUnit | null> {
    const row = await this.tenantDb.getDb().selectFrom('product_units').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async findByBarcode(barcode: string): Promise<ProductUnit | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('product_units')
      .selectAll()
      .where('barcode', '=', barcode)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateProductUnitProps): Promise<ProductUnit> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('product_units')
      .values({
        product_id: props.productId,
        unit_id: props.unitId,
        is_base_unit: props.isBaseUnit ?? false,
        conversion_factor: props.conversionFactor,
        purchase_price: props.purchasePrice ?? null,
        selling_price: props.sellingPrice ?? null,
        barcode: props.barcode ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateProductUnitProps): Promise<ProductUnit | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('product_units')
      .set({
        ...(props.unitId !== undefined ? { unit_id: props.unitId } : {}),
        ...(props.isBaseUnit !== undefined ? { is_base_unit: props.isBaseUnit } : {}),
        ...(props.conversionFactor !== undefined ? { conversion_factor: props.conversionFactor } : {}),
        ...(props.purchasePrice !== undefined ? { purchase_price: props.purchasePrice } : {}),
        ...(props.sellingPrice !== undefined ? { selling_price: props.sellingPrice } : {}),
        ...(props.barcode !== undefined ? { barcode: props.barcode } : {}),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('product_units').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
