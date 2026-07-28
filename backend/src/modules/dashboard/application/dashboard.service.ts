import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  DashboardSummary,
  DeadStockItem,
  CategorySales,
  IDashboardRepository,
  LowStockItem,
  MonthlyGraphPoint,
  TopSellingItem,
  WarehouseStock,
} from '../domain/dashboard.repository.interface';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

@Injectable()
export class DashboardService {
  constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: IDashboardRepository) {}

  getSummary(): Promise<DashboardSummary> {
    return this.dashboardRepository.getSummary();
  }

  getLowStockItems(): Promise<LowStockItem[]> {
    return this.dashboardRepository.getLowStockItems();
  }

  getDeadStock(): Promise<DeadStockItem[]> {
    return this.dashboardRepository.getDeadStock();
  }

  getTopSellingItems(days = 30, limit = 10): Promise<TopSellingItem[]> {
    return this.dashboardRepository.getTopSellingItems(clamp(days, 1, 365), clamp(limit, 1, 100));
  }

  getSalesGraph(months = 12): Promise<MonthlyGraphPoint[]> {
    return this.dashboardRepository.getSalesGraph(clamp(months, 1, 36));
  }

  getPurchaseGraph(months = 12): Promise<MonthlyGraphPoint[]> {
    return this.dashboardRepository.getPurchaseGraph(clamp(months, 1, 36));
  }

  getWarehouseStock(): Promise<WarehouseStock[]> {
    return this.dashboardRepository.getWarehouseStock();
  }

  getCategorySales(days = 30): Promise<CategorySales[]> {
    return this.dashboardRepository.getCategorySales(clamp(days, 1, 365));
  }
}
