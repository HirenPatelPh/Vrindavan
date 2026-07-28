export const REPORTS_REPOSITORY = Symbol('REPORTS_REPOSITORY');

export interface ReportDateRange {
  fromDate: string;
  toDate: string;
}

export interface SalesRegisterFilters extends ReportDateRange {
  customerId?: string;
  status?: string;
}

export interface PurchaseRegisterFilters extends ReportDateRange {
  supplierId?: string;
  status?: string;
}

export interface SalesRegisterRow {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  customerId: string;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

export interface PurchaseRegisterRow {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  supplierId: string;
  supplierName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

export interface ProductBreakdownRow {
  productId: string;
  productName: string;
  sku: string;
  totalQuantity: number;
  totalAmount: number;
  invoiceCount: number;
}

export interface CustomerBreakdownRow {
  customerId: string;
  customerName: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface SupplierBreakdownRow {
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface GstSummaryRow {
  gstRateId: string | null;
  gstRateName: string;
  totalRate: number;
  taxableValue: number;
  taxAmount: number;
  invoiceCount: number;
}

export interface IReportsRepository {
  salesRegister(filters: SalesRegisterFilters): Promise<SalesRegisterRow[]>;
  purchaseRegister(filters: PurchaseRegisterFilters): Promise<PurchaseRegisterRow[]>;
  salesByProduct(range: ReportDateRange): Promise<ProductBreakdownRow[]>;
  purchaseByProduct(range: ReportDateRange): Promise<ProductBreakdownRow[]>;
  salesByCustomer(range: ReportDateRange): Promise<CustomerBreakdownRow[]>;
  purchaseBySupplier(range: ReportDateRange): Promise<SupplierBreakdownRow[]>;
  gstOutputSummary(range: ReportDateRange): Promise<GstSummaryRow[]>;
  gstInputSummary(range: ReportDateRange): Promise<GstSummaryRow[]>;
}
