// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_TodayFigures _$TodayFiguresFromJson(Map<String, dynamic> json) =>
    _TodayFigures(
      amount: _toDouble(json['amount']),
      count: (json['count'] as num).toInt(),
    );

Map<String, dynamic> _$TodayFiguresToJson(_TodayFigures instance) =>
    <String, dynamic>{'amount': instance.amount, 'count': instance.count};

_QuickStats _$QuickStatsFromJson(Map<String, dynamic> json) => _QuickStats(
  activeProducts: (json['activeProducts'] as num).toInt(),
  activeCustomers: (json['activeCustomers'] as num).toInt(),
  activeSuppliers: (json['activeSuppliers'] as num).toInt(),
  activeWarehouses: (json['activeWarehouses'] as num).toInt(),
);

Map<String, dynamic> _$QuickStatsToJson(_QuickStats instance) =>
    <String, dynamic>{
      'activeProducts': instance.activeProducts,
      'activeCustomers': instance.activeCustomers,
      'activeSuppliers': instance.activeSuppliers,
      'activeWarehouses': instance.activeWarehouses,
    };

_DashboardSummary _$DashboardSummaryFromJson(
  Map<String, dynamic> json,
) => _DashboardSummary(
  todaySales: TodayFigures.fromJson(json['todaySales'] as Map<String, dynamic>),
  todayPurchase: TodayFigures.fromJson(
    json['todayPurchase'] as Map<String, dynamic>,
  ),
  todayDispatchCount: (json['todayDispatchCount'] as num).toInt(),
  todayInwardCount: (json['todayInwardCount'] as num).toInt(),
  stockValue: _toDouble(json['stockValue']),
  pendingPurchaseOrders: (json['pendingPurchaseOrders'] as num).toInt(),
  pendingSalesOrders: (json['pendingSalesOrders'] as num).toInt(),
  quickStats: QuickStats.fromJson(json['quickStats'] as Map<String, dynamic>),
);

Map<String, dynamic> _$DashboardSummaryToJson(_DashboardSummary instance) =>
    <String, dynamic>{
      'todaySales': instance.todaySales,
      'todayPurchase': instance.todayPurchase,
      'todayDispatchCount': instance.todayDispatchCount,
      'todayInwardCount': instance.todayInwardCount,
      'stockValue': instance.stockValue,
      'pendingPurchaseOrders': instance.pendingPurchaseOrders,
      'pendingSalesOrders': instance.pendingSalesOrders,
      'quickStats': instance.quickStats,
    };

_LowStockItem _$LowStockItemFromJson(Map<String, dynamic> json) =>
    _LowStockItem(
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      sku: json['sku'] as String,
      reorderLevel: _toDouble(json['reorderLevel']),
      minimumStock: _toDouble(json['minimumStock']),
      totalQuantity: _toDouble(json['totalQuantity']),
      totalAvailable: _toDouble(json['totalAvailable']),
    );

Map<String, dynamic> _$LowStockItemToJson(_LowStockItem instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'productName': instance.productName,
      'sku': instance.sku,
      'reorderLevel': instance.reorderLevel,
      'minimumStock': instance.minimumStock,
      'totalQuantity': instance.totalQuantity,
      'totalAvailable': instance.totalAvailable,
    };

_DeadStockItem _$DeadStockItemFromJson(Map<String, dynamic> json) =>
    _DeadStockItem(
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      sku: json['sku'] as String,
      totalQuantity: _toDouble(json['totalQuantity']),
      stockValue: _toDouble(json['stockValue']),
      lastSaleDate: json['lastSaleDate'] == null
          ? null
          : DateTime.parse(json['lastSaleDate'] as String),
    );

Map<String, dynamic> _$DeadStockItemToJson(_DeadStockItem instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'productName': instance.productName,
      'sku': instance.sku,
      'totalQuantity': instance.totalQuantity,
      'stockValue': instance.stockValue,
      'lastSaleDate': instance.lastSaleDate?.toIso8601String(),
    };

_TopSellingItem _$TopSellingItemFromJson(Map<String, dynamic> json) =>
    _TopSellingItem(
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      sku: json['sku'] as String,
      totalQuantitySold: _toDouble(json['totalQuantitySold']),
      totalSalesAmount: _toDouble(json['totalSalesAmount']),
    );

Map<String, dynamic> _$TopSellingItemToJson(_TopSellingItem instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'productName': instance.productName,
      'sku': instance.sku,
      'totalQuantitySold': instance.totalQuantitySold,
      'totalSalesAmount': instance.totalSalesAmount,
    };

_MonthlyGraphPoint _$MonthlyGraphPointFromJson(Map<String, dynamic> json) =>
    _MonthlyGraphPoint(
      month: json['month'] as String,
      totalAmount: _toDouble(json['totalAmount']),
      count: (json['count'] as num).toInt(),
    );

Map<String, dynamic> _$MonthlyGraphPointToJson(_MonthlyGraphPoint instance) =>
    <String, dynamic>{
      'month': instance.month,
      'totalAmount': instance.totalAmount,
      'count': instance.count,
    };

_WarehouseStock _$WarehouseStockFromJson(Map<String, dynamic> json) =>
    _WarehouseStock(
      warehouseId: json['warehouseId'] as String,
      warehouseName: json['warehouseName'] as String,
      totalQuantity: _toDouble(json['totalQuantity']),
      totalStockValue: _toDouble(json['totalStockValue']),
    );

Map<String, dynamic> _$WarehouseStockToJson(_WarehouseStock instance) =>
    <String, dynamic>{
      'warehouseId': instance.warehouseId,
      'warehouseName': instance.warehouseName,
      'totalQuantity': instance.totalQuantity,
      'totalStockValue': instance.totalStockValue,
    };

_CategorySales _$CategorySalesFromJson(Map<String, dynamic> json) =>
    _CategorySales(
      categoryId: json['categoryId'] as String,
      categoryName: json['categoryName'] as String,
      totalAmount: _toDouble(json['totalAmount']),
      totalQuantity: _toDouble(json['totalQuantity']),
    );

Map<String, dynamic> _$CategorySalesToJson(_CategorySales instance) =>
    <String, dynamic>{
      'categoryId': instance.categoryId,
      'categoryName': instance.categoryName,
      'totalAmount': instance.totalAmount,
      'totalQuantity': instance.totalQuantity,
    };
