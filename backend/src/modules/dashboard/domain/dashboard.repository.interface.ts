export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface TodayFigures {
  amount: number;
  count: number;
}

export interface DashboardSummary {
  todaySales: TodayFigures;
  todayPurchase: TodayFigures;
  todayDispatchCount: number;
  todayInwardCount: number;
  stockValue: number;
  pendingPurchaseOrders: number;
  pendingSalesOrders: number;
  quickStats: {
    activeProducts: number;
    activeCustomers: number;
    activeSuppliers: number;
    activeWarehouses: number;
  };
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  reorderLevel: number;
  minimumStock: number;
  totalQuantity: number;
  totalAvailable: number;
}

export interface DeadStockItem {
  productId: string;
  productName: string;
  sku: string;
  totalQuantity: number;
  stockValue: number;
  lastSaleDate: Date | null;
}

export interface TopSellingItem {
  productId: string;
  productName: string;
  sku: string;
  totalQuantitySold: number;
  totalSalesAmount: number;
}

export interface MonthlyGraphPoint {
  month: string;
  totalAmount: number;
  count: number;
}

export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  totalQuantity: number;
  totalStockValue: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  totalQuantity: number;
}

export interface IDashboardRepository {
  getSummary(): Promise<DashboardSummary>;
  getLowStockItems(): Promise<LowStockItem[]>;
  getDeadStock(): Promise<DeadStockItem[]>;
  getTopSellingItems(days: number, limit: number): Promise<TopSellingItem[]>;
  getSalesGraph(months: number): Promise<MonthlyGraphPoint[]>;
  getPurchaseGraph(months: number): Promise<MonthlyGraphPoint[]>;
  getWarehouseStock(): Promise<WarehouseStock[]>;
  getCategorySales(days: number): Promise<CategorySales[]>;
}
