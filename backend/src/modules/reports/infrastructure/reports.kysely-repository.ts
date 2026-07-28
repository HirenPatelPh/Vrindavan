import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import {
  CustomerBreakdownRow,
  GstSummaryRow,
  IReportsRepository,
  ProductBreakdownRow,
  PurchaseRegisterFilters,
  PurchaseRegisterRow,
  ReportDateRange,
  SalesRegisterFilters,
  SalesRegisterRow,
  SupplierBreakdownRow,
} from '../domain/report.repository.interface';

function toNum(value: string | number | null | undefined): number {
  return value == null ? 0 : Number(value);
}

/**
 * Every query here reads directly from the transactional tables with a caller-supplied
 * fromDate/toDate range, following DashboardKyselyRepository's exact precedent — a DB view
 * can't bake in an arbitrary runtime date range, so this stays in Node/SQL query form instead
 * of a view. `status <> 'cancelled'` is the default filter everywhere Dashboard already uses it;
 * the register reports let the caller narrow to one specific status instead.
 */
@Injectable()
export class ReportsKyselyRepository implements IReportsRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async salesRegister(filters: SalesRegisterFilters): Promise<SalesRegisterRow[]> {
    const db = this.tenantDb.getDb();
    let query = db
      .selectFrom('sales_invoices')
      .innerJoin('customers', 'customers.id', 'sales_invoices.customer_id')
      .select([
        'sales_invoices.id as invoice_id',
        'sales_invoices.invoice_number',
        'sales_invoices.invoice_date',
        'sales_invoices.customer_id',
        'customers.name as customer_name',
        'sales_invoices.subtotal',
        'sales_invoices.tax_amount',
        'sales_invoices.discount_amount',
        'sales_invoices.total_amount',
        'sales_invoices.paid_amount',
        'sales_invoices.status',
      ])
      .where('sales_invoices.invoice_date', '>=', new Date(filters.fromDate))
      .where('sales_invoices.invoice_date', '<=', new Date(filters.toDate));

    query = filters.status
      ? query.where('sales_invoices.status', '=', filters.status)
      : query.where('sales_invoices.status', '<>', 'cancelled');
    if (filters.customerId) query = query.where('sales_invoices.customer_id', '=', filters.customerId);

    const rows = await query.orderBy('sales_invoices.invoice_date', 'desc').execute();
    return rows.map((r) => ({
      invoiceId: r.invoice_id,
      invoiceNumber: r.invoice_number,
      invoiceDate: r.invoice_date,
      customerId: r.customer_id,
      customerName: r.customer_name,
      subtotal: toNum(r.subtotal),
      taxAmount: toNum(r.tax_amount),
      discountAmount: toNum(r.discount_amount),
      totalAmount: toNum(r.total_amount),
      paidAmount: toNum(r.paid_amount),
      status: r.status,
    }));
  }

  async purchaseRegister(filters: PurchaseRegisterFilters): Promise<PurchaseRegisterRow[]> {
    const db = this.tenantDb.getDb();
    let query = db
      .selectFrom('purchase_invoices')
      .innerJoin('suppliers', 'suppliers.id', 'purchase_invoices.supplier_id')
      .select([
        'purchase_invoices.id as invoice_id',
        'purchase_invoices.invoice_number',
        'purchase_invoices.invoice_date',
        'purchase_invoices.supplier_id',
        'suppliers.name as supplier_name',
        'purchase_invoices.subtotal',
        'purchase_invoices.tax_amount',
        'purchase_invoices.discount_amount',
        'purchase_invoices.total_amount',
        'purchase_invoices.paid_amount',
        'purchase_invoices.status',
      ])
      .where('purchase_invoices.invoice_date', '>=', new Date(filters.fromDate))
      .where('purchase_invoices.invoice_date', '<=', new Date(filters.toDate));

    query = filters.status
      ? query.where('purchase_invoices.status', '=', filters.status)
      : query.where('purchase_invoices.status', '<>', 'cancelled');
    if (filters.supplierId) query = query.where('purchase_invoices.supplier_id', '=', filters.supplierId);

    const rows = await query.orderBy('purchase_invoices.invoice_date', 'desc').execute();
    return rows.map((r) => ({
      invoiceId: r.invoice_id,
      invoiceNumber: r.invoice_number,
      invoiceDate: r.invoice_date,
      supplierId: r.supplier_id,
      supplierName: r.supplier_name,
      subtotal: toNum(r.subtotal),
      taxAmount: toNum(r.tax_amount),
      discountAmount: toNum(r.discount_amount),
      totalAmount: toNum(r.total_amount),
      paidAmount: toNum(r.paid_amount),
      status: r.status,
    }));
  }

  async salesByProduct(range: ReportDateRange): Promise<ProductBreakdownRow[]> {
    const result = await sql<{
      product_id: string;
      product_name: string;
      sku: string;
      total_quantity: string;
      total_amount: string;
      invoice_count: string;
    }>`
      SELECT p.id AS product_id, p.name AS product_name, p.sku,
             COALESCE(SUM(sil.quantity), 0)::text AS total_quantity,
             COALESCE(SUM(sil.line_total), 0)::text AS total_amount,
             COUNT(DISTINCT si.id)::text AS invoice_count
      FROM sales_invoice_lines sil
      JOIN sales_invoices si ON si.id = sil.invoice_id
      JOIN products p ON p.id = sil.product_id
      WHERE si.invoice_date >= ${range.fromDate} AND si.invoice_date <= ${range.toDate}
        AND si.status <> 'cancelled'
      GROUP BY p.id, p.name, p.sku
      ORDER BY SUM(sil.line_total) DESC
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      productId: r.product_id,
      productName: r.product_name,
      sku: r.sku,
      totalQuantity: toNum(r.total_quantity),
      totalAmount: toNum(r.total_amount),
      invoiceCount: toNum(r.invoice_count),
    }));
  }

  async purchaseByProduct(range: ReportDateRange): Promise<ProductBreakdownRow[]> {
    const result = await sql<{
      product_id: string;
      product_name: string;
      sku: string;
      total_quantity: string;
      total_amount: string;
      invoice_count: string;
    }>`
      SELECT p.id AS product_id, p.name AS product_name, p.sku,
             COALESCE(SUM(pil.quantity), 0)::text AS total_quantity,
             COALESCE(SUM(pil.line_total), 0)::text AS total_amount,
             COUNT(DISTINCT pi.id)::text AS invoice_count
      FROM purchase_invoice_lines pil
      JOIN purchase_invoices pi ON pi.id = pil.invoice_id
      JOIN products p ON p.id = pil.product_id
      WHERE pi.invoice_date >= ${range.fromDate} AND pi.invoice_date <= ${range.toDate}
        AND pi.status <> 'cancelled'
      GROUP BY p.id, p.name, p.sku
      ORDER BY SUM(pil.line_total) DESC
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      productId: r.product_id,
      productName: r.product_name,
      sku: r.sku,
      totalQuantity: toNum(r.total_quantity),
      totalAmount: toNum(r.total_amount),
      invoiceCount: toNum(r.invoice_count),
    }));
  }

  async salesByCustomer(range: ReportDateRange): Promise<CustomerBreakdownRow[]> {
    const result = await sql<{
      customer_id: string;
      customer_name: string;
      total_amount: string;
      invoice_count: string;
    }>`
      SELECT c.id AS customer_id, c.name AS customer_name,
             COALESCE(SUM(si.total_amount), 0)::text AS total_amount,
             COUNT(si.id)::text AS invoice_count
      FROM sales_invoices si
      JOIN customers c ON c.id = si.customer_id
      WHERE si.invoice_date >= ${range.fromDate} AND si.invoice_date <= ${range.toDate}
        AND si.status <> 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY SUM(si.total_amount) DESC
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      customerId: r.customer_id,
      customerName: r.customer_name,
      totalAmount: toNum(r.total_amount),
      invoiceCount: toNum(r.invoice_count),
    }));
  }

  async purchaseBySupplier(range: ReportDateRange): Promise<SupplierBreakdownRow[]> {
    const result = await sql<{
      supplier_id: string;
      supplier_name: string;
      total_amount: string;
      invoice_count: string;
    }>`
      SELECT s.id AS supplier_id, s.name AS supplier_name,
             COALESCE(SUM(pi.total_amount), 0)::text AS total_amount,
             COUNT(pi.id)::text AS invoice_count
      FROM purchase_invoices pi
      JOIN suppliers s ON s.id = pi.supplier_id
      WHERE pi.invoice_date >= ${range.fromDate} AND pi.invoice_date <= ${range.toDate}
        AND pi.status <> 'cancelled'
      GROUP BY s.id, s.name
      ORDER BY SUM(pi.total_amount) DESC
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      supplierId: r.supplier_id,
      supplierName: r.supplier_name,
      totalAmount: toNum(r.total_amount),
      invoiceCount: toNum(r.invoice_count),
    }));
  }

  async gstOutputSummary(range: ReportDateRange): Promise<GstSummaryRow[]> {
    const result = await sql<{
      gst_rate_id: string | null;
      gst_rate_name: string;
      total_rate: string;
      taxable_value: string;
      tax_amount: string;
      invoice_count: string;
    }>`
      SELECT gr.id AS gst_rate_id,
             COALESCE(gr.name, 'No GST') AS gst_rate_name,
             COALESCE(gr.total_rate, 0)::text AS total_rate,
             COALESCE(SUM(sil.line_total - sil.tax_amount), 0)::text AS taxable_value,
             COALESCE(SUM(sil.tax_amount), 0)::text AS tax_amount,
             COUNT(DISTINCT si.id)::text AS invoice_count
      FROM sales_invoice_lines sil
      JOIN sales_invoices si ON si.id = sil.invoice_id
      LEFT JOIN gst_rates gr ON gr.id = sil.gst_id
      WHERE si.invoice_date >= ${range.fromDate} AND si.invoice_date <= ${range.toDate}
        AND si.status <> 'cancelled'
      GROUP BY gr.id, gr.name, gr.total_rate
      ORDER BY gr.total_rate NULLS FIRST
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      gstRateId: r.gst_rate_id,
      gstRateName: r.gst_rate_name,
      totalRate: toNum(r.total_rate),
      taxableValue: toNum(r.taxable_value),
      taxAmount: toNum(r.tax_amount),
      invoiceCount: toNum(r.invoice_count),
    }));
  }

  async gstInputSummary(range: ReportDateRange): Promise<GstSummaryRow[]> {
    const result = await sql<{
      gst_rate_id: string | null;
      gst_rate_name: string;
      total_rate: string;
      taxable_value: string;
      tax_amount: string;
      invoice_count: string;
    }>`
      SELECT gr.id AS gst_rate_id,
             COALESCE(gr.name, 'No GST') AS gst_rate_name,
             COALESCE(gr.total_rate, 0)::text AS total_rate,
             COALESCE(SUM(pil.line_total - pil.tax_amount), 0)::text AS taxable_value,
             COALESCE(SUM(pil.tax_amount), 0)::text AS tax_amount,
             COUNT(DISTINCT pi.id)::text AS invoice_count
      FROM purchase_invoice_lines pil
      JOIN purchase_invoices pi ON pi.id = pil.invoice_id
      LEFT JOIN gst_rates gr ON gr.id = pil.gst_id
      WHERE pi.invoice_date >= ${range.fromDate} AND pi.invoice_date <= ${range.toDate}
        AND pi.status <> 'cancelled'
      GROUP BY gr.id, gr.name, gr.total_rate
      ORDER BY gr.total_rate NULLS FIRST
    `.execute(this.tenantDb.getDb());

    return result.rows.map((r) => ({
      gstRateId: r.gst_rate_id,
      gstRateName: r.gst_rate_name,
      totalRate: toNum(r.total_rate),
      taxableValue: toNum(r.taxable_value),
      taxAmount: toNum(r.tax_amount),
      invoiceCount: toNum(r.invoice_count),
    }));
  }
}
