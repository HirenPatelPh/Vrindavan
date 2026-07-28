import { ApiProperty } from '@nestjs/swagger';
import {
  CategorySales,
  DashboardSummary,
  DeadStockItem,
  LowStockItem,
  MonthlyGraphPoint,
  TopSellingItem,
  WarehouseStock,
} from '../../domain/dashboard.repository.interface';

class TodayFiguresDto {
  @ApiProperty() amount!: number;
  @ApiProperty() count!: number;
}

class QuickStatsDto {
  @ApiProperty() activeProducts!: number;
  @ApiProperty() activeCustomers!: number;
  @ApiProperty() activeSuppliers!: number;
  @ApiProperty() activeWarehouses!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: TodayFiguresDto }) todaySales!: TodayFiguresDto;
  @ApiProperty({ type: TodayFiguresDto }) todayPurchase!: TodayFiguresDto;
  @ApiProperty() todayDispatchCount!: number;
  @ApiProperty() todayInwardCount!: number;
  @ApiProperty() stockValue!: number;
  @ApiProperty() pendingPurchaseOrders!: number;
  @ApiProperty() pendingSalesOrders!: number;
  @ApiProperty({ type: QuickStatsDto }) quickStats!: QuickStatsDto;

  constructor(summary: DashboardSummary) {
    Object.assign(this, summary);
  }
}

export class LowStockItemDto implements LowStockItem {
  @ApiProperty() productId!: string;
  @ApiProperty() productName!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() reorderLevel!: number;
  @ApiProperty() minimumStock!: number;
  @ApiProperty() totalQuantity!: number;
  @ApiProperty() totalAvailable!: number;

  constructor(item: LowStockItem) {
    Object.assign(this, item);
  }
}

export class DeadStockItemDto implements DeadStockItem {
  @ApiProperty() productId!: string;
  @ApiProperty() productName!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() totalQuantity!: number;
  @ApiProperty() stockValue!: number;
  @ApiProperty({ nullable: true }) lastSaleDate!: Date | null;

  constructor(item: DeadStockItem) {
    Object.assign(this, item);
  }
}

export class TopSellingItemDto implements TopSellingItem {
  @ApiProperty() productId!: string;
  @ApiProperty() productName!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() totalQuantitySold!: number;
  @ApiProperty() totalSalesAmount!: number;

  constructor(item: TopSellingItem) {
    Object.assign(this, item);
  }
}

export class MonthlyGraphPointDto implements MonthlyGraphPoint {
  @ApiProperty({ example: '2026-07' }) month!: string;
  @ApiProperty() totalAmount!: number;
  @ApiProperty() count!: number;

  constructor(point: MonthlyGraphPoint) {
    Object.assign(this, point);
  }
}

export class WarehouseStockDto implements WarehouseStock {
  @ApiProperty() warehouseId!: string;
  @ApiProperty() warehouseName!: string;
  @ApiProperty() totalQuantity!: number;
  @ApiProperty() totalStockValue!: number;

  constructor(item: WarehouseStock) {
    Object.assign(this, item);
  }
}

export class CategorySalesDto implements CategorySales {
  @ApiProperty() categoryId!: string;
  @ApiProperty() categoryName!: string;
  @ApiProperty() totalAmount!: number;
  @ApiProperty() totalQuantity!: number;

  constructor(item: CategorySales) {
    Object.assign(this, item);
  }
}
