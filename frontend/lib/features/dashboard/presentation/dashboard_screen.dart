import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../application/dashboard_provider.dart';
import '../domain/dashboard_models.dart';
import 'dashboard_advanced.dart';

String _currency(double v) => '₹${v.toStringAsFixed(2)}';

String _compact(double v) {
  if (v.abs() >= 10000000) return '₹${(v / 10000000).toStringAsFixed(2)}Cr';
  if (v.abs() >= 100000) return '₹${(v / 100000).toStringAsFixed(2)}L';
  if (v.abs() >= 1000) return '₹${(v / 1000).toStringAsFixed(1)}k';
  return '₹${v.toStringAsFixed(0)}';
}

const _teal = Color(0xFF1D9E75);
const _tealDark = Color(0xFF0F6E56);
const _slate = Color(0xFF94A3B8);
const _amber = Color(0xFFB8860B);
const _red = Color(0xFFA32D2D);

// Shared building blocks for the redesigned list widgets.

Widget _rankBadge(int rank, Color color) => Container(
      width: 22,
      height: 22,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
      child: Text('$rank', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
    );

Widget _bar(double frac, Color color) => ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: LinearProgressIndicator(
        value: frac.clamp(0.0, 1.0),
        minHeight: 6,
        backgroundColor: const Color(0xFFEEF1F4),
        valueColor: AlwaysStoppedAnimation(color),
      ),
    );

Widget _pill(String text, Color color) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
      child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );

/// A ranked metric row: rank badge, name + subtitle, trailing value, and a proportional bar.
Widget _rankedRow({
  required int rank,
  required String title,
  String? subtitle,
  required String value,
  required double barFrac,
  Color color = _teal,
}) =>
    Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        children: [
          Row(
            children: [
              _rankBadge(rank, color),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Tooltip(
                  message: title,
                  waitDuration: const Duration(milliseconds: 300),
                  child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                ),
                    if (subtitle != null) Text(subtitle, style: const TextStyle(fontSize: 11, color: _slate)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            ],
          ),
          Padding(padding: const EdgeInsets.only(top: 6, left: 32), child: _bar(barFrac, color)),
        ],
      ),
    );

/// An alert-style row (low/dead stock): name + subtitle on the left, a coloured status pill on the right.
Widget _alertRow({required String title, required String subtitle, required String pillText, required Color color}) =>
    Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Container(width: 6, height: 34, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Tooltip(
                  message: title,
                  waitDuration: const Duration(milliseconds: 300),
                  child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                ),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: _slate)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          _pill(pillText, color),
        ],
      ),
    );

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
          ..invalidate(receivablesProvider);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const DashboardAdvancedSection(),
          const SizedBox(height: 24),
          const _SummarySection(),
          const SizedBox(height: 24),
          _ExpandableGraphSection(title: 'Sales (last 12 months)', points: ref.watch(salesGraphProvider), color: _teal),
          const SizedBox(height: 12),
          _ExpandableGraphSection(title: 'Purchases (last 12 months)', points: ref.watch(purchaseGraphProvider), color: _slate),
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

/// A collapsible sales/purchase trend card: a compact header (title, total, trend chip, preview
/// sparkline) that expands on tap to reveal the full interactive line chart with tooltips.
class _ExpandableGraphSection extends StatefulWidget {
  const _ExpandableGraphSection({required this.title, required this.points, required this.color});

  final String title;
  final AsyncValue<List<MonthlyGraphPoint>> points;
  final Color color;

  @override
  State<_ExpandableGraphSection> createState() => _ExpandableGraphSectionState();
}

class _ExpandableGraphSectionState extends State<_ExpandableGraphSection> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: widget.points.when(
        loading: () => const SizedBox(height: 76, child: Center(child: CircularProgressIndicator())),
        error: (e, _) => Padding(padding: const EdgeInsets.all(16), child: _ErrorText(e)),
        data: (data) {
          final total = data.fold<double>(0, (a, p) => a + p.totalAmount);
          String? trend;
          var up = true;
          if (data.length >= 2) {
            final last = data[data.length - 1].totalAmount;
            final prev = data[data.length - 2].totalAmount;
            if (prev > 0) {
              final pct = ((last - prev) / prev) * 100;
              up = pct >= 0;
              trend = '${up ? '▲' : '▼'} ${pct.abs().toStringAsFixed(1)}%';
            }
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              InkWell(
                onTap: () => setState(() => _expanded = !_expanded),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(width: 9, height: 9, margin: const EdgeInsets.only(right: 10), decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle)),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.title, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                            const SizedBox(height: 2),
                            Text(_compact(total), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      if (trend != null) ...[
                        _pill(trend, up ? _tealDark : _red),
                        const SizedBox(width: 10),
                      ],
                      if (!_expanded && data.length >= 2)
                        SizedBox(width: 84, height: 32, child: _miniLine(data, widget.color)),
                      Icon(_expanded ? Icons.expand_less : Icons.expand_more, color: _slate),
                    ],
                  ),
                ),
              ),
              if (_expanded)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: data.isEmpty
                      ? const SizedBox(height: 80, child: Center(child: Text('No data yet')))
                      : SizedBox(height: 220, child: _fullChart(data, widget.color)),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _miniLine(List<MonthlyGraphPoint> data, Color color) {
    return LineChart(LineChartData(
      lineTouchData: const LineTouchData(enabled: false),
      titlesData: const FlTitlesData(show: false),
      gridData: const FlGridData(show: false),
      borderData: FlBorderData(show: false),
      lineBarsData: [
        LineChartBarData(
          spots: [for (var i = 0; i < data.length; i++) FlSpot(i.toDouble(), data[i].totalAmount)],
          isCurved: true,
          color: color,
          barWidth: 2,
          dotData: const FlDotData(show: false),
          belowBarData: BarAreaData(show: true, color: color.withValues(alpha: 0.10)),
        ),
      ],
    ));
  }

  Widget _fullChart(List<MonthlyGraphPoint> data, Color color) {
    final maxY = data.map((p) => p.totalAmount).fold<double>(0, (a, b) => a > b ? a : b);
    return LineChart(LineChartData(
      minY: 0,
      maxY: maxY <= 0 ? 10 : maxY * 1.2,
      lineTouchData: LineTouchData(
        touchTooltipData: LineTouchTooltipData(
          getTooltipItems: (spots) => spots
              .map((s) => LineTooltipItem('${data[s.x.toInt()].month.substring(5)}\n${_compact(s.y)}',
                  const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)))
              .toList(),
        ),
      ),
      titlesData: FlTitlesData(
        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            getTitlesWidget: (value, meta) {
              final i = value.toInt();
              if (i < 0 || i >= data.length) return const SizedBox.shrink();
              return Padding(padding: const EdgeInsets.only(top: 4), child: Text(data[i].month.substring(5), style: const TextStyle(fontSize: 10)));
            },
          ),
        ),
        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 48)),
      ),
      borderData: FlBorderData(show: false),
      gridData: const FlGridData(show: true, drawVerticalLine: false),
      lineBarsData: [
        LineChartBarData(
          spots: [for (var i = 0; i < data.length; i++) FlSpot(i.toDouble(), data[i].totalAmount)],
          isCurved: true,
          color: color,
          barWidth: 3,
          dotData: const FlDotData(show: false),
          belowBarData: BarAreaData(show: true, color: color.withValues(alpha: 0.08)),
        ),
      ],
    ));
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
            children: [
              for (final i in data.take(8))
                _alertRow(
                  title: i.productName,
                  subtitle: '${i.sku} · reorder @ ${i.reorderLevel.toStringAsFixed(0)}',
                  pillText: '${i.totalAvailable.toStringAsFixed(0)} left',
                  color: i.totalAvailable <= 0 ? _red : _amber,
                ),
            ],
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
            children: [
              for (final i in data.take(8))
                _alertRow(
                  title: i.productName,
                  subtitle: '${i.sku} · qty ${i.totalQuantity.toStringAsFixed(0)}',
                  pillText: _compact(i.stockValue),
                  color: _slate,
                ),
            ],
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
          final sorted = [...data]..sort((a, b) => b.totalSalesAmount.compareTo(a.totalSalesAmount));
          final top = sorted.take(5).toList();
          final maxV = top.first.totalSalesAmount;
          return Column(
            children: [
              for (var idx = 0; idx < top.length; idx++)
                _rankedRow(
                  rank: idx + 1,
                  title: top[idx].productName,
                  subtitle: '${top[idx].sku} · sold ${top[idx].totalQuantitySold.toStringAsFixed(0)}',
                  value: _compact(top[idx].totalSalesAmount),
                  barFrac: maxV > 0 ? top[idx].totalSalesAmount / maxV : 0,
                  color: _teal,
                ),
            ],
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
          final sorted = [...data]..sort((a, b) => b.totalAmount.compareTo(a.totalAmount));
          final top = sorted.take(5).toList();
          final maxV = top.first.totalAmount;
          return Column(
            children: [
              for (var idx = 0; idx < top.length; idx++)
                _rankedRow(
                  rank: idx + 1,
                  title: top[idx].categoryName,
                  subtitle: 'qty ${top[idx].totalQuantity.toStringAsFixed(0)}',
                  value: _compact(top[idx].totalAmount),
                  barFrac: maxV > 0 ? top[idx].totalAmount / maxV : 0,
                  color: _tealDark,
                ),
            ],
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
          final sorted = [...data]..sort((a, b) => b.totalStockValue.compareTo(a.totalStockValue));
          final maxV = sorted.first.totalStockValue;
          return Column(
            children: [
              for (var idx = 0; idx < sorted.length; idx++)
                _rankedRow(
                  rank: idx + 1,
                  title: sorted[idx].warehouseName,
                  subtitle: 'qty ${sorted[idx].totalQuantity.toStringAsFixed(0)}',
                  value: _compact(sorted[idx].totalStockValue),
                  barFrac: maxV > 0 ? sorted[idx].totalStockValue / maxV : 0,
                  color: _teal,
                ),
            ],
          );
        },
      ),
    );
  }
}
