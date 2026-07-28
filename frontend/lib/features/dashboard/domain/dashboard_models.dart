import 'package:freezed_annotation/freezed_annotation.dart';

part 'dashboard_models.freezed.dart';
part 'dashboard_models.g.dart';

/// The backend serializes `numeric(...)` columns as plain JSON numbers, which come across
/// with no decimal point whenever the value happens to be whole (e.g. `500`, not `500.0`) —
/// json_serializable's default `as double` cast throws on those. Every double field in this
/// file goes through this converter instead.
double _toDouble(dynamic value) => (value as num).toDouble();

@freezed
abstract class TodayFigures with _$TodayFigures {
  const factory TodayFigures({
    @JsonKey(fromJson: _toDouble) required double amount,
    required int count,
  }) = _TodayFigures;

  factory TodayFigures.fromJson(Map<String, dynamic> json) => _$TodayFiguresFromJson(json);
}

@freezed
abstract class QuickStats with _$QuickStats {
  const factory QuickStats({
    required int activeProducts,
    required int activeCustomers,
    required int activeSuppliers,
    required int activeWarehouses,
  }) = _QuickStats;

  factory QuickStats.fromJson(Map<String, dynamic> json) => _$QuickStatsFromJson(json);
}

@freezed
abstract class DashboardSummary with _$DashboardSummary {
  const factory DashboardSummary({
    required TodayFigures todaySales,
    required TodayFigures todayPurchase,
    required int todayDispatchCount,
    required int todayInwardCount,
    @JsonKey(fromJson: _toDouble) required double stockValue,
    required int pendingPurchaseOrders,
    required int pendingSalesOrders,
    required QuickStats quickStats,
  }) = _DashboardSummary;

  factory DashboardSummary.fromJson(Map<String, dynamic> json) => _$DashboardSummaryFromJson(json);
}

@freezed
abstract class LowStockItem with _$LowStockItem {
  const factory LowStockItem({
    required String productId,
    required String productName,
    required String sku,
    @JsonKey(fromJson: _toDouble) required double reorderLevel,
    @JsonKey(fromJson: _toDouble) required double minimumStock,
    @JsonKey(fromJson: _toDouble) required double totalQuantity,
    @JsonKey(fromJson: _toDouble) required double totalAvailable,
  }) = _LowStockItem;

  factory LowStockItem.fromJson(Map<String, dynamic> json) => _$LowStockItemFromJson(json);
}

@freezed
abstract class DeadStockItem with _$DeadStockItem {
  const factory DeadStockItem({
    required String productId,
    required String productName,
    required String sku,
    @JsonKey(fromJson: _toDouble) required double totalQuantity,
    @JsonKey(fromJson: _toDouble) required double stockValue,
    DateTime? lastSaleDate,
  }) = _DeadStockItem;

  factory DeadStockItem.fromJson(Map<String, dynamic> json) => _$DeadStockItemFromJson(json);
}

@freezed
abstract class TopSellingItem with _$TopSellingItem {
  const factory TopSellingItem({
    required String productId,
    required String productName,
    required String sku,
    @JsonKey(fromJson: _toDouble) required double totalQuantitySold,
    @JsonKey(fromJson: _toDouble) required double totalSalesAmount,
  }) = _TopSellingItem;

  factory TopSellingItem.fromJson(Map<String, dynamic> json) => _$TopSellingItemFromJson(json);
}

@freezed
abstract class MonthlyGraphPoint with _$MonthlyGraphPoint {
  const factory MonthlyGraphPoint({
    required String month,
    @JsonKey(fromJson: _toDouble) required double totalAmount,
    required int count,
  }) = _MonthlyGraphPoint;

  factory MonthlyGraphPoint.fromJson(Map<String, dynamic> json) => _$MonthlyGraphPointFromJson(json);
}

@freezed
abstract class WarehouseStock with _$WarehouseStock {
  const factory WarehouseStock({
    required String warehouseId,
    required String warehouseName,
    @JsonKey(fromJson: _toDouble) required double totalQuantity,
    @JsonKey(fromJson: _toDouble) required double totalStockValue,
  }) = _WarehouseStock;

  factory WarehouseStock.fromJson(Map<String, dynamic> json) => _$WarehouseStockFromJson(json);
}

@freezed
abstract class CategorySales with _$CategorySales {
  const factory CategorySales({
    required String categoryId,
    required String categoryName,
    @JsonKey(fromJson: _toDouble) required double totalAmount,
    @JsonKey(fromJson: _toDouble) required double totalQuantity,
  }) = _CategorySales;

  factory CategorySales.fromJson(Map<String, dynamic> json) => _$CategorySalesFromJson(json);
}
