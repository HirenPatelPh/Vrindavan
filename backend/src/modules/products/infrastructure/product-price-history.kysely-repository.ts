import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { ProductPriceHistory } from '../../../infrastructure/database/kysely/db.types';
import { PriceType, ProductPriceHistoryEntry } from '../domain/product-price-history.entity';
import { IProductPriceHistoryRepository } from '../domain/product-price-history.repository.interface';

type Row = Selectable<ProductPriceHistory>;

function toDomain(row: Row): ProductPriceHistoryEntry {
  return new ProductPriceHistoryEntry(
    row.id,
    row.product_id,
    row.price_type as PriceType,
    row.old_price === null ? null : Number(row.old_price),
    Number(row.new_price),
    row.changed_by,
    row.changed_at,
  );
}

@Injectable()
export class ProductPriceHistoryKyselyRepository implements IProductPriceHistoryRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findAllByProduct(productId: string): Promise<ProductPriceHistoryEntry[]> {
    const rows = await this.tenantDb
      .getDb()
      .selectFrom('product_price_history')
      .selectAll()
      .where('product_id', '=', productId)
      .orderBy('changed_at', 'desc')
      .execute();
    return rows.map(toDomain);
  }
}
