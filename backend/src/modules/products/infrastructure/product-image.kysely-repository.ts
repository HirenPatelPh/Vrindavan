import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { ProductImages } from '../../../infrastructure/database/kysely/db.types';
import { ProductImage, CreateProductImageProps } from '../domain/product-image.entity';
import { IProductImageRepository } from '../domain/product-image.repository.interface';

type Row = Selectable<ProductImages>;

function toDomain(row: Row): ProductImage {
  return new ProductImage(row.id, row.product_id, row.image_url, row.is_primary, row.sort_order, row.created_at);
}

@Injectable()
export class ProductImageKyselyRepository implements IProductImageRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAllByProduct(productId: string): Promise<ProductImage[]> {
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('product_images')
      .selectAll()
      .where('product_id', '=', productId)
      .orderBy('sort_order')
      .execute();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<ProductImage | null> {
    const row = await this.tenantDb.getDb().selectFrom('product_images').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async create(props: CreateProductImageProps): Promise<ProductImage> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('product_images')
      .values({
        product_id: props.productId,
        image_url: props.imageUrl,
        is_primary: props.isPrimary ?? false,
        sort_order: props.sortOrder ?? 0,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async unsetPrimaryForProduct(productId: string): Promise<void> {
    await this.tenantDb
      .getDb()
      .updateTable('product_images')
      .set({ is_primary: false })
      .where('product_id', '=', productId)
      .where('is_primary', '=', true)
      .execute();
  }

  async setPrimary(id: string): Promise<ProductImage | null> {
    const row = await this.tenantDb
      .getDb()
      .updateTable('product_images')
      .set({ is_primary: true })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantDb.getDb().deleteFrom('product_images').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }
}
