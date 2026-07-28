import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { Products } from '../../../infrastructure/database/kysely/db.types';
import { Product, CreateProductProps, UpdateProductProps } from '../domain/product.entity';
import { IProductRepository } from '../domain/product.repository.interface';

type Row = Selectable<Products>;

function toDomain(row: Row): Product {
  return new Product(
    row.id,
    row.name,
    row.sku,
    row.barcode,
    row.qr_code,
    row.category_id,
    row.sub_category_id,
    row.brand_id,
    row.hsn_id,
    row.gst_id,
    row.base_unit_id,
    Number(row.purchase_price),
    Number(row.selling_price),
    row.mrp === null ? null : Number(row.mrp),
    Number(row.minimum_stock),
    row.maximum_stock === null ? null : Number(row.maximum_stock),
    Number(row.reorder_level),
    Number(row.opening_stock),
    row.pieces_per_box,
    row.pieces_per_bag,
    row.weight === null ? null : Number(row.weight),
    row.weight_unit,
    row.dimension_length === null ? null : Number(row.dimension_length),
    row.dimension_width === null ? null : Number(row.dimension_width),
    row.dimension_height === null ? null : Number(row.dimension_height),
    row.dimension_unit,
    row.has_batch_tracking,
    row.has_expiry_tracking,
    row.remarks,
    row.is_active,
    row.created_at,
    row.updated_at,
  );
}

@Injectable()
export class ProductKyselyRepository implements IProductRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.tenantDb.getDb().selectFrom('products').selectAll().orderBy('name').execute();
    return rows.map(toDomain);
  }

  async findAllPaginated(offset: number, limit: number): Promise<Product[]> {
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('products')
      .selectAll()
      .orderBy('name')
      .limit(limit)
      .offset(offset)
      .execute();
    return rows.map(toDomain);
  }

  async count(): Promise<number> {
    const result = await this.tenantDb
      .getDb()
      .selectFrom('products')
      .select((eb) => eb.fn.countAll<string>().as('count'))
      .executeTakeFirstOrThrow();
    return Number(result.count);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.tenantDb.getDb().selectFrom('products').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateProductProps): Promise<Product> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('products')
      .values({
        name: props.name,
        sku: props.sku,
        barcode: props.barcode ?? null,
        qr_code: props.qrCode ?? null,
        category_id: props.categoryId,
        sub_category_id: props.subCategoryId ?? null,
        brand_id: props.brandId ?? null,
        hsn_id: props.hsnId ?? null,
        gst_id: props.gstId ?? null,
        base_unit_id: props.baseUnitId,
        purchase_price: props.purchasePrice ?? 0,
        selling_price: props.sellingPrice ?? 0,
        mrp: props.mrp ?? null,
        minimum_stock: props.minimumStock ?? 0,
        maximum_stock: props.maximumStock ?? null,
        reorder_level: props.reorderLevel ?? 0,
        opening_stock: props.openingStock ?? 0,
        pieces_per_box: props.piecesPerBox ?? null,
        pieces_per_bag: props.piecesPerBag ?? null,
        weight: props.weight ?? null,
        weight_unit: props.weightUnit ?? null,
        dimension_length: props.dimensionLength ?? null,
        dimension_width: props.dimensionWidth ?? null,
        dimension_height: props.dimensionHeight ?? null,
        dimension_unit: props.dimensionUnit ?? null,
        has_batch_tracking: props.hasBatchTracking ?? false,
        has_expiry_tracking: props.hasExpiryTracking ?? false,
        remarks: props.remarks ?? null,
        is_active: props.isActive ?? true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async update(id: string, props: UpdateProductProps): Promise<Product | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('products')
      .set({
        ...(props.name !== undefined ? { name: props.name } : {}),
        ...(props.sku !== undefined ? { sku: props.sku } : {}),
        ...(props.barcode !== undefined ? { barcode: props.barcode } : {}),
        ...(props.qrCode !== undefined ? { qr_code: props.qrCode } : {}),
        ...(props.categoryId !== undefined ? { category_id: props.categoryId } : {}),
        ...(props.subCategoryId !== undefined ? { sub_category_id: props.subCategoryId } : {}),
        ...(props.brandId !== undefined ? { brand_id: props.brandId } : {}),
        ...(props.hsnId !== undefined ? { hsn_id: props.hsnId } : {}),
        ...(props.gstId !== undefined ? { gst_id: props.gstId } : {}),
        ...(props.baseUnitId !== undefined ? { base_unit_id: props.baseUnitId } : {}),
        ...(props.purchasePrice !== undefined ? { purchase_price: props.purchasePrice } : {}),
        ...(props.sellingPrice !== undefined ? { selling_price: props.sellingPrice } : {}),
        ...(props.mrp !== undefined ? { mrp: props.mrp } : {}),
        ...(props.minimumStock !== undefined ? { minimum_stock: props.minimumStock } : {}),
        ...(props.maximumStock !== undefined ? { maximum_stock: props.maximumStock } : {}),
        ...(props.reorderLevel !== undefined ? { reorder_level: props.reorderLevel } : {}),
        ...(props.openingStock !== undefined ? { opening_stock: props.openingStock } : {}),
        ...(props.piecesPerBox !== undefined ? { pieces_per_box: props.piecesPerBox } : {}),
        ...(props.piecesPerBag !== undefined ? { pieces_per_bag: props.piecesPerBag } : {}),
        ...(props.weight !== undefined ? { weight: props.weight } : {}),
        ...(props.weightUnit !== undefined ? { weight_unit: props.weightUnit } : {}),
        ...(props.dimensionLength !== undefined ? { dimension_length: props.dimensionLength } : {}),
        ...(props.dimensionWidth !== undefined ? { dimension_width: props.dimensionWidth } : {}),
        ...(props.dimensionHeight !== undefined ? { dimension_height: props.dimensionHeight } : {}),
        ...(props.dimensionUnit !== undefined ? { dimension_unit: props.dimensionUnit } : {}),
        ...(props.hasBatchTracking !== undefined ? { has_batch_tracking: props.hasBatchTracking } : {}),
        ...(props.hasExpiryTracking !== undefined ? { has_expiry_tracking: props.hasExpiryTracking } : {}),
        ...(props.remarks !== undefined ? { remarks: props.remarks } : {}),
        ...(props.isActive !== undefined ? { is_active: props.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('products').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }

  async search(query: string, limit: number): Promise<Product[]> {
    const pattern = `%${query}%`;
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('products')
      .selectAll()
      .where((eb) => eb.or([eb('name', 'ilike', pattern), eb('sku', 'ilike', pattern)]))
      .orderBy('name')
      .limit(limit)
      .execute();
    return rows.map(toDomain);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('products')
      .selectAll()
      .where('barcode', '=', barcode)
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }
}
