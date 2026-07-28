import '../../../core/api/api_client.dart';
import '../domain/dashboard_models.dart';

/// Raw calls to backend/src/modules/dashboard/presentation/dashboard.controller.ts. Every
/// endpoint here uses the backend's own defaults (days=30, limit=10, months=12) — this
/// foundation pass doesn't expose date-range controls in the UI yet.
class DashboardApi {
  DashboardApi(this._client);

  final ApiClient _client;

  Future<DashboardSummary> getSummary() async {
    final data = await _client.get('/dashboard/summary');
    return DashboardSummary.fromJson(data as Map<String, dynamic>);
  }

  Future<List<LowStockItem>> getLowStockItems() async {
    final data = await _client.get('/dashboard/low-stock-items');
    return (data as List).map((e) => LowStockItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<DeadStockItem>> getDeadStock() async {
    final data = await _client.get('/dashboard/dead-stock');
    return (data as List).map((e) => DeadStockItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<TopSellingItem>> getTopSellingItems() async {
    final data = await _client.get('/dashboard/top-selling-items');
    return (data as List).map((e) => TopSellingItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<MonthlyGraphPoint>> getSalesGraph() async {
    final data = await _client.get('/dashboard/sales-graph');
    return (data as List).map((e) => MonthlyGraphPoint.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<MonthlyGraphPoint>> getPurchaseGraph() async {
    final data = await _client.get('/dashboard/purchase-graph');
    return (data as List).map((e) => MonthlyGraphPoint.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<WarehouseStock>> getWarehouseStock() async {
    final data = await _client.get('/dashboard/warehouse-stock');
    return (data as List).map((e) => WarehouseStock.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<CategorySales>> getCategorySales() async {
    final data = await _client.get('/dashboard/category-sales');
    return (data as List).map((e) => CategorySales.fromJson(e as Map<String, dynamic>)).toList();
  }
}
