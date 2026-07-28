import { Injectable } from '@nestjs/common';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { OpeningStockAlreadyPostedError } from '../domain/inventory-document.errors';
import { postStockMovement } from './stock-posting.helper';

@Injectable()
export class OpeningStockKyselyRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async post(
    productId: string,
    warehouseId: string,
    quantity: number,
    unitCost: number,
    createdBy?: string,
  ): Promise<void> {
    await this.tenantDb.getDb().transaction().execute(async (trx) => {
      const existing = await trx
        .selectFrom('stock_ledger')
        .select('id')
        .where('movement_type', '=', 'opening_stock')
        .where('reference_type', '=', 'product')
        .where('reference_id', '=', productId)
        .executeTakeFirst();
      if (existing) throw new OpeningStockAlreadyPostedError(`Opening stock already posted for product ${productId}`);

      await postStockMovement(trx, {
        productId,
        warehouseId,
        movementType: 'opening_stock',
        qtyIn: quantity,
        unitCost,
        referenceType: 'product',
        referenceId: productId,
        createdBy,
      });
    });
  }
}
