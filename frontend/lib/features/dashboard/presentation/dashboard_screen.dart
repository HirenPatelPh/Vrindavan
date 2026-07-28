import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../application/dashboard_provider.dart';
import '../domain/dashboard_models.dart';
import 'dashboard_advanced.dart';

String _currency(double v) => '₹${v.toStringAsFixed(2)}';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return RefreshIndicator(
      onRefresh: () async {
        ref
          ..invalidate(dashboardSummaryProvider)
          ..invalidate(lowStockItemsProvider)
          ..invalidate(deadStockItemsProvider)
          ..invalidate(topSellingItemsProvider)
          ..invalidate(salesGraphProvider)
          ..invalidate(purchaseGraphProvider)
          ..invalidate(warehouseStockProvider)
          ..invalidate(categorySalesProvider)
          ..invalidate(receivablesProvider)
          ..invalidate(gstSummaryProvider);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const DashboardAdvancedSection(),
          const SizedBox(height: 24),
          const _SummarySection(),
          const SizedBox(height: 24),
          _GraphSection(title: 'Sales (last 12 months)', points: ref.watch(salesGraphProvider)),
          const SizedBox(height: 16),
          _GraphSection(title: 'Purchases (last 12 months)', points: ref.watch(purchaseGraphProvider)),
          const SizedBox(height: 24),
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _LowStockSection()),
              SizedBox(width: 16),
              Expanded(child: _DeadStockSection()),
            ],
          ),
          const SizedBox(height: 16),
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _TopSellingSection()),
              SizedBox(width: 16),
              Expanded(child: _CategorySalesSection()),
            ],
          ),
          const SizedBox(height: 16),
          const _WarehouseStockSection(),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _ErrorText extends StatelessWidget {
  const _ErrorText(this.error);

  final Object error;

  @override
  Widget build(BuildContext context) {
    return Text('Could not load this data: $error', style: TextStyle(color: Theme.of(context).colorScheme.error));
  }
}

class _SummarySection extends ConsumerWidget {
  const _SummarySection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summary = ref.watch(dashboardSummaryProvider);
    return summary.when(
      loading: () => const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())),
      error: (e, _) => _ErrorText(e),
      data: (s) => Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          _KpiCard(label: "Today's Sales", value: _currency(s.todaySales.amount), sub: '${s.todaySales.count} invoices'),
          _KpiCard(
            label: "Today's Purchases",
            value: _currency(s.todayPurchase.amount),
            sub: '${s.todayPurchase.count} invoices',
          ),
          _KpiCard(label: 'Stock Value', value: _currency(s.stockValue)),
          _KpiCard(label: 'Pending Purchase Orders', value: '${s.pendingPurchaseOrders}'),
          _KpiCard(label: 'Pending Sales Orders', value: '${s.pendingSalesOrders}'),
          _KpiCard(label: "Today's Dispatches", value: '${s.todayDispatchCount}'),
          _KpiCard(label: "Today's Inwards", value: '${s.todayInwardCount}'),
          _KpiCard(label: 'Active Products', value: '${s.quickStats.activeProducts}'),
          _KpiCard(label: 'Active Customers', value: '${s.quickStats.activeCustomers}'),
          _KpiCard(label: 'Active Suppliers', value: '${s.quickStats.activeSuppliers}'),
          _KpiCard(label: 'Active Warehouses', value: '${s.quickStats.activeWarehouses}'),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({required this.label, required this.value, this.sub});

  final String label;
  final String value;
  final String? sub;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        width: 190,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.headlineSmall),
            if (sub != null) ...[
              const SizedBox(height: 4),
              Text(sub!, style: Theme.of(context).textTheme.bodySmall),
            ],
          ],
        ),
      ),
    );
  }
}

class _GraphSection extends StatelessWidget {
  const _GraphSection({required this.title, required this.points});

  final String title;
  final AsyncValue<List<MonthlyGraphPoint>> points;

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: title,
      child: points.when(
        loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
        error: (e, _) => _ErrorText(e),
        data: (data) {
          if (data.isEmpty) return const SizedBox(height: 100, child: Center(child: Text('No data yet')));
          final maxY = data.map((p) => p.totalAmount).fold<double>(0, (a, b) => a > b ? a : b);
          return SizedBox(
            height: 220,
            child: LineChart(
              LineChartData(
                minY: 0,
                maxY: maxY <= 0 ? 10 : maxY * 1.2,
                titlesData: FlTitlesData(
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final i = value.toInt();
                        if (i < 0 || i >= data.length) return const SizedBox.shrink();
                        return Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(data[i].month.substring(5), style: const TextStyle(fontSize: 10)),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 48)),
                ),
                borderData: FlBorderData(show: false),
                gridData: const FlGridData(show: true, drawVerticalLine: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: [for (var i = 0; i < data.length; i++) FlSpot(i.toDouble(), data[i].totalAmount)],
                    isCurved: true,
                    barWidth: 3,
                    dotData: const FlDotData(show: false),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _LowStockSection extends ConsumerWidget {
  const _LowStockSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(lowStockItemsProvider);
    return _SectionCard(
      title: 'Low Stock',
      child: items.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorText(e),
        data: (data) {
          if (data.isEmpty) return const Text('Nothing below reorder level.');
          return Column(
            children: data
                .take(10)
                .map(
                  (i) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(i.productName),
                    subtitle: Text('${i.sku} · available ${i.totalAvailable.toStringAsFixed(0)}'),
                    trailing: Text('reorder @ ${i.reorderLevel.toStringAsFixed(0)}'),
                  ),
                )
                .toList(),
          );
        },
      ),
    );
  }
}

class _DeadStockSection extends ConsumerWidget {
  const _DeadStockSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(deadStockItemsProvider);
    return _SectionCard(
      title: 'Dead Stock',
      child: items.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorText(e),
        data: (data) {
          if (data.isEmpty) return const Text('No dead stock.');
          return Column(
            children: data
                .take(10)
                .map(
                  (i) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(i.productName),
                    subtitle: Text('${i.sku} · qty ${i.totalQuantity.toStringAsFixed(0)}'),
                    trailing: Text(_currency(i.stockValue)),
                  ),
                )
                .toList(),
          );
        },
      ),
    );
  }
}

class _TopSellingSection extends ConsumerWidget {
  const _TopSellingSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(topSellingItemsProvider);
    return _SectionCard(
      title: 'Top Selling',
      child: items.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorText(e),
        data: (data) {
          if (data.isEmpty) return const Text('No sales yet.');
          return Column(
            children: data
                .map(
                  (i) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(i.productName),
                    subtitle: Text('${i.sku} · sold ${i.totalQuantitySold.toStringAsFixed(0)}'),
                    trailing: Text(_currency(i.totalSalesAmount)),
                  ),
                )
                .toList(),
          );
        },
      ),
    );
  }
}

class _CategorySalesSection extends ConsumerWidget {
  const _CategorySalesSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(categorySalesProvider);
    return _SectionCard(
      title: 'Category Sales',
      child: items.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorText(e),
        data: (data) {
          if (data.isEmpty) return const Text('No sales yet.');
          return Column(
            children: data
                .map(
                  (i) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(i.categoryName),
                    subtitle: Text('qty ${i.totalQuantity.toStringAsFixed(0)}'),
                    trailing: Text(_currency(i.totalAmount)),
                  ),
                )
                .toList(),
          );
        },
      ),
    );
  }
}

class _WarehouseStockSection extends ConsumerWidget {
  const _WarehouseStockSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(warehouseStockProvider);
    return _SectionCard(
      title: 'Warehouse Stock',
      child: items.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorText(e),
        data: (data) {
          if (data.isEmpty) return const Text('No warehouses yet.');
          return Column(
            children: data
                .map(
                  (i) => ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(i.warehouseName),
                    subtitle: Text('qty ${i.totalQuantity.toStringAsFixed(0)}'),
                    trailing: Text(_currency(i.totalStockValue)),
                  ),
                )
                .toList(),
          );
        },
      ),
    );
  }
}
