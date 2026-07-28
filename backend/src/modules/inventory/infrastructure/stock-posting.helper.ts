import { Kysely, Transaction, sql } from 'kysely';
import { DB } from '../../../infrastructure/database/kysely/db.types';
import { InsufficientStockError } from '../domain/inventory-document.errors';

export type Executor = Kysely<DB> | Transaction<DB>;

export type MovementType =
  | 'opening_stock'
  | 'purchase_in'
  | 'sales_out'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'return_in'
  | 'return_out'
  | 'damage_out'
  | 'verification_adjustment_in'
  | 'verification_adjustment_out';

export interface PostMovementInput {
  productId: string;
  warehouseId: string;
  rackId?: string | null;
  locationId?: string | null;
  batchId?: string | null;
  movementType: MovementType;
  qtyIn?: number;
  qtyOut?: number;
  unitCost?: number;
  referenceType: string;
  referenceId: string;
  referenceLineId?: string;
  remarks?: string;
  createdBy?: string;
}

export interface LiveBalanceDimensions {
  productId: string;
  warehouseId: string;
  rackId?: string | null;
  locationId?: string | null;
  batchId?: string | null;
}

export interface LiveBalance {
  quantity: number;
  averageCost: number;
}

/**
 * Shared infrastructure-only helpers used by every Inventory document's `approve()` — each
 * document's Kysely repository wraps its own `db.transaction().execute(async (trx) => {...})`
 * and calls these directly with that `trx`, so the header status update and every line's
 * ledger post commit or roll back together. Deliberately plain functions, not a DI-injected
 * repository behind a domain interface: the whole point is that they operate inside a
 * transaction handle the *caller* owns, which a domain-level interface would have no clean
 * way to express without leaking Kysely's Transaction type into the domain layer.
 *
 * stock_balances is never written here (or anywhere in application code) — only
 * tenant_template.trg_stock_ledger_to_balance (Phase 1) writes it, in reaction to the
 * stock_ledger insert below.
 */
export async function postStockMovement(executor: Executor, input: PostMovementInput): Promise<void> {
  // Guard the DB's stock_balances_check constraint (which rejects negative on-hand) with a clear,
  // catchable error: an outbound movement can't remove more than what's on hand at that exact
  // dimension. Central here so every outbound document (transfer_out / sales_out / damage_out /
  // return_out) gets the same friendly "insufficient stock" message instead of a raw 500.
  // Inbound movements and quantity-to-a-target moves (adjustments/verifications, whose target is
  // always >= 0) never trip this.
  const qtyOut = input.qtyOut ?? 0;
  if (qtyOut > 0) {
    const balance = await getLiveBalance(executor, {
      productId: input.productId,
      warehouseId: input.warehouseId,
      rackId: input.rackId,
      locationId: input.locationId,
      batchId: input.batchId,
    });
    const available = balance?.quantity ?? 0;
    if (available < qtyOut) {
      const product = await executor
        .selectFrom('products')
        .select('name')
        .where('id', '=', input.productId)
        .executeTakeFirst();
      throw new InsufficientStockError(
        `Insufficient stock for "${product?.name ?? 'product'}": ${available} available, ${qtyOut} required at the warehouse.`,
      );
    }
  }

  await executor
    .insertInto('stock_ledger')
    .values({
      product_id: input.productId,
      warehouse_id: input.warehouseId,
      rack_id: input.rackId ?? null,
      location_id: input.locationId ?? null,
      batch_id: input.batchId ?? null,
      movement_type: input.movementType,
      qty_in: input.qtyIn ?? 0,
      qty_out: input.qtyOut ?? 0,
      unit_cost: input.unitCost ?? 0,
      reference_type: input.referenceType,
      reference_id: input.referenceId,
      reference_line_id: input.referenceLineId ?? null,
      remarks: input.remarks ?? null,
      created_by: input.createdBy ?? null,
    })
    .execute();
}

/** Current stock_balances snapshot for one exact dimension — the "live" reference point that adjustments/verifications/transfers recompute against at approval time, not whatever was captured when the draft was created. */
export async function getLiveBalance(executor: Executor, dims: LiveBalanceDimensions): Promise<LiveBalance | null> {
  // Same NULL-safe COALESCE dimension matching as stock_balances' own unique index and
  // Phase 1's trg_stock_ledger_to_balance (rack/location/batch are optional dimensions).
  const result = await sql<{ quantity: string; average_cost: string }>`
    SELECT quantity, average_cost FROM stock_balances
    WHERE product_id = ${dims.productId}
      AND warehouse_id = ${dims.warehouseId}
      AND COALESCE(rack_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${dims.rackId ?? null}::uuid, '00000000-0000-0000-0000-000000000000')
      AND COALESCE(location_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${dims.locationId ?? null}::uuid, '00000000-0000-0000-0000-000000000000')
      AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${dims.batchId ?? null}::uuid, '00000000-0000-0000-0000-000000000000')
  `.execute(executor);
  const row = result.rows[0];
  return row ? { quantity: Number(row.quantity), averageCost: Number(row.average_cost) } : null;
}
