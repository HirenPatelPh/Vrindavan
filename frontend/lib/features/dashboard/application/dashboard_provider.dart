import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/providers/core_providers.dart';
import '../data/dashboard_api.dart';
import '../domain/dashboard_models.dart';

part 'dashboard_provider.g.dart';

@riverpod
DashboardApi dashboardApi(Ref ref) => DashboardApi(ref.watch(apiClientProvider));

// One provider per Dashboard widget — a slow/failing graph query shouldn't block the summary
// cards or vice versa; each card gets its own independent loading/error state.

@riverpod
Future<DashboardSummary> dashboardSummary(Ref ref) => ref.watch(dashboardApiProvider).getSummary();

@riverpod
Future<List<LowStockItem>> lowStockItems(Ref ref) => ref.watch(dashboardApiProvider).getLowStockItems();

@riverpod
Future<List<DeadStockItem>> deadStockItems(Ref ref) => ref.watch(dashboardApiProvider).getDeadStock();

@riverpod
Future<List<TopSellingItem>> topSellingItems(Ref ref) => ref.watch(dashboardApiProvider).getTopSellingItems();

@riverpod
Future<List<MonthlyGraphPoint>> salesGraph(Ref ref) => ref.watch(dashboardApiProvider).getSalesGraph();

@riverpod
Future<List<MonthlyGraphPoint>> purchaseGraph(Ref ref) => ref.watch(dashboardApiProvider).getPurchaseGraph();

@riverpod
Future<List<WarehouseStock>> warehouseStock(Ref ref) => ref.watch(dashboardApiProvider).getWarehouseStock();

@riverpod
Future<List<CategorySales>> categorySales(Ref ref) => ref.watch(dashboardApiProvider).getCategorySales();
