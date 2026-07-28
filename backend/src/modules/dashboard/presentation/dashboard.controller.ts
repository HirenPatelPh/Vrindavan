import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { DashboardService } from '../application/dashboard.service';
import { TopSellingQueryDto, MonthlyGraphQueryDto, CategorySalesQueryDto } from './dto/dashboard-query.dto';
import {
  DashboardSummaryDto,
  LowStockItemDto,
  DeadStockItemDto,
  TopSellingItemDto,
  MonthlyGraphPointDto,
  WarehouseStockDto,
  CategorySalesDto,
} from './dto/dashboard-response.dto';

@ApiTags('dashboard')
@RequirePermissions('dashboard.view')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(): Promise<DashboardSummaryDto> {
    return new DashboardSummaryDto(await this.dashboardService.getSummary());
  }

  @Get('low-stock-items')
  async getLowStockItems(): Promise<LowStockItemDto[]> {
    const items = await this.dashboardService.getLowStockItems();
    return items.map((i) => new LowStockItemDto(i));
  }

  @Get('dead-stock')
  async getDeadStock(): Promise<DeadStockItemDto[]> {
    const items = await this.dashboardService.getDeadStock();
    return items.map((i) => new DeadStockItemDto(i));
  }

  @Get('top-selling-items')
  async getTopSellingItems(@Query() query: TopSellingQueryDto): Promise<TopSellingItemDto[]> {
    const items = await this.dashboardService.getTopSellingItems(query.days, query.limit);
    return items.map((i) => new TopSellingItemDto(i));
  }

  @Get('sales-graph')
  async getSalesGraph(@Query() query: MonthlyGraphQueryDto): Promise<MonthlyGraphPointDto[]> {
    const points = await this.dashboardService.getSalesGraph(query.months);
    return points.map((p) => new MonthlyGraphPointDto(p));
  }

  @Get('purchase-graph')
  async getPurchaseGraph(@Query() query: MonthlyGraphQueryDto): Promise<MonthlyGraphPointDto[]> {
    const points = await this.dashboardService.getPurchaseGraph(query.months);
    return points.map((p) => new MonthlyGraphPointDto(p));
  }

  @Get('warehouse-stock')
  async getWarehouseStock(): Promise<WarehouseStockDto[]> {
    const items = await this.dashboardService.getWarehouseStock();
    return items.map((i) => new WarehouseStockDto(i));
  }

  @Get('category-sales')
  async getCategorySales(@Query() query: CategorySalesQueryDto): Promise<CategorySalesDto[]> {
    const items = await this.dashboardService.getCategorySales(query.days);
    return items.map((i) => new CategorySalesDto(i));
  }
}
