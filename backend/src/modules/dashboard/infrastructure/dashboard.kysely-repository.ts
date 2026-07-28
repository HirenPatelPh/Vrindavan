import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import {
  DashboardSummary,
  DeadStockItem,
  CategorySales,
  IDashboardRepository,
  LowStockItem,
  MonthlyGraphPoint,
  TopSellingItem,
  WarehouseStock,
} from '../domain/dashboard.repository.interface';

function toNum(value: string | number | null | undefined): number {
  return value == null ? 0 : Number(value);
}

interface TodayFiguresRow {
  amount: string | null;
  count: string;
}

interface QuickStatsRow {
  active_products: string;
  active_customers: string;
  active_suppliers: string;
  active_warehouses: string;
}

/**
 * Reads directly from transactional tables (sales_invoices, purchase_invoices, ...), not
 * from sales_daily_aggregates — that table is Phase 9 (AI) rollup infrastructure with no
 * populating job yet, so a dashboard built on it would silently show zeros. "Today" and month
 * bucketing are computed Postgres-side (CURRENT_DATE, date_trunc) via `sql`, never from the
 * Node process's clock, so app-server/database timezone drift can't skew the numbers.
 */
@Injectable()
export class DashboardKyselyRepository implements IDashboardRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async getSummary(): Promise<DashboardSummary> {
    const db = this.tenantDb.getDb();

    const [todaySales, todayPurchase, todayDispatch, todayInward, stockValue, pendingPO, pendingSO, quickStats] =
      await Promise.all([
        sql<TodayFiguresRow>`
          SELECT COALESCE(SUM(total_amount), 0)::text AS amount, COUNT(*)::text AS count
          FROM sales_invoices WHERE invoice_date = CURRENT_DATE AND status <> 'cancelled'
        `.execute(db),
        sql<TodayFiguresRow>`
          SELECT COALESCE(SUM(total_amount), 0)::text AS amount, COUNT(*)::text AS count
          FROM purchase_invoices WHERE invoice_date = CURRENT_DATE AND status <> 'cancelled'
        `.execute(db),
        sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM delivery_challans WHERE dc_date = CURRENT_DATE`.execute(db),
        sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM goods_received_notes WHERE grn_date = CURRENT_DATE`.execute(db),
        sql<{ total: string | null }>`SELECT COALESCE(SUM(total_stock_value), 0)::text AS total FROM v_warehouse_stock_value`.execute(db),
        sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM purchase_orders WHERE status NOT IN ('completed', 'cancelled')`.execute(db),
        sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM sales_orders WHERE status NOT IN ('completed', 'cancelled')`.execute(db),
        sql<QuickStatsRow>`
          SELECT
            (SELECT COUNT(*) FROM products WHERE is_active)::text AS active_products,
            (SELECT COUNT(*) FROM customers WHERE is_active)::text AS active_customers,
            (SELECT COUNT(*) FROM suppliers WHERE is_active)::text AS active_suppliers,
            (SELECT COUNT(*) FROM warehouses WHERE is_active)::text AS active_warehouses
        `.execute(db),
      ]);

    const qs = quickStats.rows[0];

    return {
      todaySales: { amount: toNum(todaySales.rows[0].amount), count: toNum(todaySales.rows[0].count) },
      todayPurchase: { amount: toNum(todayPurchase.rows[0].amount), count: toNum(todayPurchase.rows[0].count) },
      todayDispatchCount: toNum(todayDispatch.rows[0].count),
      todayInwardCount: toNum(todayInward.rows[0].count),
      stockValue: toNum(stockValue.rows[0].total),
      pendingPurchaseOrders: toNum(pendingPO.rows[0].count),
      pendingSalesOrders: toNum(pendingSO.rows[0].count),
      quickStats: {
        activeProducts: toNum(qs.active_products),
        activeCustomers: toNum(qs.active_customers),
        activeSuppliers: toNum(qs.active_suppliers),
        activeWarehouses: toNum(qs.active_warehouses),
      },
    };
  }

  async getLowStockItems(): Promise<LowStockItem[]> {
    const rows = await this.tenantDb.getDb().selectFrom('v_low_stock_items').selectAll().execute();
    return rows
      .filter((r) => r.product_id !== null)
      .map((r) => ({
        productId: r.product_id!,
        productName: r.product_name!,
        sku: r.sku!,
        reorderLevel: toNum(r.reorder_level),
        minimumStock: toNum(r.minimum_stock),
        totalQuantity: toNum(r.total_quantity),
        totalAvailable: toNum(r.total_available),
      }));
  }

  async getDeadStock(): Promise<DeadStockItem[]> {
    const rows = await this.tenantDb.getDb().selectFrom('v_dead_stock').selectAll().execute();
    return rows
      .filter((r) => r.product_id !== null)
      .map((r) => ({
        productId: r.product_id!,
        productName: r.product_name!,
        sku: r.sku!,
        totalQuantity: toNum(r.total_quantity),
        stockValue: toNum(r.stock_value),
        lastSaleDate: r.last_sale_date,
      }));
  }

  async getTopSellingItems(days: number, limit: number): Promise<TopSellingItem[]> {
    const result = await sql<{
      product_id: string;
      product_name: string;
      sku: string;
      total_quantity_sold: string;
      total_sales_amount: string;
    }>`
      SELECT p.id AS product_id, p.name AS product_name, p.sku,
             COALESCE(SUM(sil.quantity), 0)::text AS total_quantity_sold,
             COALESCE(SUM(sil.line_total), 0)::text AS total_sales_amount
      FROM sales_invoice_lines sil
      JOIN sales_invoices si ON si.id = sil.invoice_id
      JOIN products p ON p.id = sil.product_id
      WHERE si.invoice_date >= CURRENT_DATE - (${days}::int - 1)
        AND si.status <> 'cancelled'
      GROUP BY p.id, p.name, p.sku
      ORDER BY SUM(sil.quantity) DESC
      LIMIT ${limit}
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      productId: r.product_id,
      productName: r.product_name,
      sku: r.sku,
      totalQuantitySold: toNum(r.total_quantity_sold),
      totalSalesAmount: toNum(r.total_sales_amount),
    }));
  }

  async getSalesGraph(months: number): Promise<MonthlyGraphPoint[]> {
    return this.getMonthlyGraph('sales_invoices', months);
  }

  async getPurchaseGraph(months: number): Promise<MonthlyGraphPoint[]> {
    return this.getMonthlyGraph('purchase_invoices', months);
  }

  private async getMonthlyGraph(table: 'sales_invoices' | 'purchase_invoices', months: number): Promise<MonthlyGraphPoint[]> {
    // Both sales_invoices and purchase_invoices use `invoice_date` as the column name.
    const result = await sql<{ month: string; total_amount: string; count: string }>`
      SELECT to_char(gs.bucket, 'YYYY-MM') AS month,
             COALESCE(SUM(t.total_amount), 0)::text AS total_amount,
             COUNT(t.id)::text AS count
      FROM generate_series(
             date_trunc('month', CURRENT_DATE) - (${months}::int - 1) * interval '1 month',
             date_trunc('month', CURRENT_DATE),
             interval '1 month'
           ) AS gs(bucket)
      LEFT JOIN ${sql.raw(table)} t
        ON date_trunc('month', t.invoice_date) = gs.bucket AND t.status <> 'cancelled'
      GROUP BY gs.bucket
      ORDER BY gs.bucket
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({ month: r.month, totalAmount: toNum(r.total_amount), count: toNum(r.count) }));
  }

  async getWarehouseStock(): Promise<WarehouseStock[]> {
    const rows = await this.tenantDb.getDb().selectFrom('v_warehouse_stock_value').selectAll().execute();
    return rows
      .filter((r) => r.warehouse_id !== null)
      .map((r) => ({
        warehouseId: r.warehouse_id!,
        warehouseName: r.warehouse_name!,
        totalQuantity: toNum(r.total_quantity),
        totalStockValue: toNum(r.total_stock_value),
      }));
  }

  async getCategorySales(days: number): Promise<CategorySales[]> {
    const result = await sql<{
      category_id: string;
      category_name: string;
      total_amount: string;
      total_quantity: string;
    }>`
      SELECT c.id AS category_id, c.name AS category_name,
             COALESCE(SUM(sil.line_total), 0)::text AS total_amount,
             COALESCE(SUM(sil.quantity), 0)::text AS total_quantity
      FROM sales_invoice_lines sil
      JOIN sales_invoices si ON si.id = sil.invoice_id
      JOIN products p ON p.id = sil.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE si.invoice_date >= CURRENT_DATE - (${days}::int - 1)
        AND si.status <> 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY SUM(sil.line_total) DESC
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      categoryId: r.category_id,
      categoryName: r.category_name,
      totalAmount: toNum(r.total_amount),
      totalQuantity: toNum(r.total_quantity),
    }));
  }
}
