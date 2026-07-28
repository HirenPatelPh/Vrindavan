// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(dashboardApi)
final dashboardApiProvider = DashboardApiProvider._();

final class DashboardApiProvider
    extends $FunctionalProvider<DashboardApi, DashboardApi, DashboardApi>
    with $Provider<DashboardApi> {
  DashboardApiProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dashboardApiProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dashboardApiHash();

  @$internal
  @override
  $ProviderElement<DashboardApi> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  DashboardApi create(Ref ref) {
    return dashboardApi(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(DashboardApi value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<DashboardApi>(value),
    );
  }
}

String _$dashboardApiHash() => r'8aaf5135a450a34387d144a1b1c762b7808d2684';

@ProviderFor(dashboardSummary)
final dashboardSummaryProvider = DashboardSummaryProvider._();

final class DashboardSummaryProvider
    extends
        $FunctionalProvider<
          AsyncValue<DashboardSummary>,
          DashboardSummary,
          FutureOr<DashboardSummary>
        >
    with $FutureModifier<DashboardSummary>, $FutureProvider<DashboardSummary> {
  DashboardSummaryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dashboardSummaryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dashboardSummaryHash();

  @$internal
  @override
  $FutureProviderElement<DashboardSummary> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<DashboardSummary> create(Ref ref) {
    return dashboardSummary(ref);
  }
}

String _$dashboardSummaryHash() => r'2eb0e76e2630f5af17e70874448b11c1f22bc645';

@ProviderFor(lowStockItems)
final lowStockItemsProvider = LowStockItemsProvider._();

final class LowStockItemsProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<LowStockItem>>,
          List<LowStockItem>,
          FutureOr<List<LowStockItem>>
        >
    with
        $FutureModifier<List<LowStockItem>>,
        $FutureProvider<List<LowStockItem>> {
  LowStockItemsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'lowStockItemsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$lowStockItemsHash();

  @$internal
  @override
  $FutureProviderElement<List<LowStockItem>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<LowStockItem>> create(Ref ref) {
    return lowStockItems(ref);
  }
}

String _$lowStockItemsHash() => r'e086e680003b4df175328929194a90fb897ee3b7';

@ProviderFor(deadStockItems)
final deadStockItemsProvider = DeadStockItemsProvider._();

final class DeadStockItemsProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<DeadStockItem>>,
          List<DeadStockItem>,
          FutureOr<List<DeadStockItem>>
        >
    with
        $FutureModifier<List<DeadStockItem>>,
        $FutureProvider<List<DeadStockItem>> {
  DeadStockItemsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'deadStockItemsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$deadStockItemsHash();

  @$internal
  @override
  $FutureProviderElement<List<DeadStockItem>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<DeadStockItem>> create(Ref ref) {
    return deadStockItems(ref);
  }
}

String _$deadStockItemsHash() => r'b336a7cf042fefd8160bdfc3bd451e3c76df7e6c';

@ProviderFor(topSellingItems)
final topSellingItemsProvider = TopSellingItemsProvider._();

final class TopSellingItemsProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<TopSellingItem>>,
          List<TopSellingItem>,
          FutureOr<List<TopSellingItem>>
        >
    with
        $FutureModifier<List<TopSellingItem>>,
        $FutureProvider<List<TopSellingItem>> {
  TopSellingItemsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'topSellingItemsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$topSellingItemsHash();

  @$internal
  @override
  $FutureProviderElement<List<TopSellingItem>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<TopSellingItem>> create(Ref ref) {
    return topSellingItems(ref);
  }
}

String _$topSellingItemsHash() => r'44edcb30fcb50f360cba73d3758c44077c3c31bd';

@ProviderFor(salesGraph)
final salesGraphProvider = SalesGraphProvider._();

final class SalesGraphProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<MonthlyGraphPoint>>,
          List<MonthlyGraphPoint>,
          FutureOr<List<MonthlyGraphPoint>>
        >
    with
        $FutureModifier<List<MonthlyGraphPoint>>,
        $FutureProvider<List<MonthlyGraphPoint>> {
  SalesGraphProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'salesGraphProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$salesGraphHash();

  @$internal
  @override
  $FutureProviderElement<List<MonthlyGraphPoint>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<MonthlyGraphPoint>> create(Ref ref) {
    return salesGraph(ref);
  }
}

String _$salesGraphHash() => r'026e3721318be55b57e0479e3ea2554d71399467';

@ProviderFor(purchaseGraph)
final purchaseGraphProvider = PurchaseGraphProvider._();

final class PurchaseGraphProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<MonthlyGraphPoint>>,
          List<MonthlyGraphPoint>,
          FutureOr<List<MonthlyGraphPoint>>
        >
    with
        $FutureModifier<List<MonthlyGraphPoint>>,
        $FutureProvider<List<MonthlyGraphPoint>> {
  PurchaseGraphProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'purchaseGraphProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$purchaseGraphHash();

  @$internal
  @override
  $FutureProviderElement<List<MonthlyGraphPoint>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<MonthlyGraphPoint>> create(Ref ref) {
    return purchaseGraph(ref);
  }
}

String _$purchaseGraphHash() => r'3f342f1740903a4917fce1131d5a455cba4db87c';

@ProviderFor(warehouseStock)
final warehouseStockProvider = WarehouseStockProvider._();

final class WarehouseStockProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<WarehouseStock>>,
          List<WarehouseStock>,
          FutureOr<List<WarehouseStock>>
        >
    with
        $FutureModifier<List<WarehouseStock>>,
        $FutureProvider<List<WarehouseStock>> {
  WarehouseStockProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'warehouseStockProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$warehouseStockHash();

  @$internal
  @override
  $FutureProviderElement<List<WarehouseStock>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<WarehouseStock>> create(Ref ref) {
    return warehouseStock(ref);
  }
}

String _$warehouseStockHash() => r'e98bb8711ab358bbbd8fce1023a5992593a8c5fb';

@ProviderFor(categorySales)
final categorySalesProvider = CategorySalesProvider._();

final class CategorySalesProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<CategorySales>>,
          List<CategorySales>,
          FutureOr<List<CategorySales>>
        >
    with
        $FutureModifier<List<CategorySales>>,
        $FutureProvider<List<CategorySales>> {
  CategorySalesProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'categorySalesProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$categorySalesHash();

  @$internal
  @override
  $FutureProviderElement<List<CategorySales>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<CategorySales>> create(Ref ref) {
    return categorySales(ref);
  }
}

String _$categorySalesHash() => r'a54253af8ad4d40a2a07a39ca8e886d81760d69f';
