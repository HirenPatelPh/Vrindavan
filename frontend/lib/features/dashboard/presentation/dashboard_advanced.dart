import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../application/dashboard_provider.dart';
import '../domain/dashboard_models.dart';

// Teal accent family, matching the sidebar/cards elsewhere.
const _teal600 = Color(0xFF0F6E56);
const _teal400 = Color(0xFF1D9E75);
const _teal300 = Color(0xFF5DCAA5);
const _teal200 = Color(0xFF9FE1CB);
const _slate = Color(0xFF94A3B8);
const _donutColors = [_teal600, _teal400, _teal300, _teal200, _slate];

String _compact(double v) {
  if (v.abs() >= 10000000) return '₹${(v / 10000000).toStringAsFixed(2)}Cr';
  if (v.abs() >= 100000) return '₹${(v / 100000).toStringAsFixed(2)}L';
  if (v.abs() >= 1000) return '₹${(v / 1000).toStringAsFixed(1)}k';
  return '₹${v.toStringAsFixed(0)}';
}

// ---- Client-side providers for the two widgets that aren't in the dashboard endpoints ----

final receivablesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final data = await ref.read(apiClientProvider).get('/sales/outstanding-receivables');
  return (data as List).cast<Map<String, dynamic>>();
});

/// The advanced analytics band shown at the top of the dashboard (above the existing sections):
/// KPI tiles with sparklines, a category-mix donut, top-products bars, receivables aging, and a
/// GST output/input/net card. Reuses existing dashboard providers where possible.
class DashboardAdvancedSection extends StatelessWidget {
  const DashboardAdvancedSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _KpiRow(),
        SizedBox(height: 16),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: _CategoryDonutCard()),
            SizedBox(width: 16),
            Expanded(child: _StockHealthCard()),
          ],
        ),
        SizedBox(height: 16),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: _TopProductsCard()),
            SizedBox(width: 16),
            Expanded(child: _ReceivablesAgingCard()),
          ],
        ),
      ],
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.title, required this.child});
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
            Text(title, style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

// ---- KPI tiles ----

class _KpiRow extends ConsumerWidget {
  const _KpiRow();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sales = ref.watch(salesGraphProvider);
    final purchases = ref.watch(purchaseGraphProvider);
    final summary = ref.watch(dashboardSummaryProvider);
    final receivables = ref.watch(receivablesProvider);

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _kpiFromGraph('Revenue (12 mo)', sales, _teal400),
        _kpiFromGraph('Purchases (12 mo)', purchases, _slate),
        _kpiTile(
          'Stock value',
          summary.whenOrNull(data: (s) => _compact(s.stockValue)) ?? '—',
          subtitle: summary.whenOrNull(data: (s) => '${s.quickStats.activeProducts} products'),
        ),
        _kpiTile(
          'Receivables',
          receivables.whenOrNull(
                  data: (rows) => _compact(rows.fold(0.0, (a, r) => a + ((r['outstandingAmount'] as num?)?.toDouble() ?? 0)))) ??
              '—',
          subtitle: receivables.whenOrNull(
              data: (rows) => '${rows.where((r) => ((r['daysOverdue'] as num?) ?? 0) > 0).length} overdue'),
        ),
      ],
    );
  }

  Widget _kpiFromGraph(String label, AsyncValue<List<MonthlyGraphPoint>> async, Color color) {
    return async.when(
      loading: () => _kpiTile(label, '…'),
      error: (_, _) => _kpiTile(label, '—'),
      data: (points) {
        final total = points.fold(0.0, (a, p) => a + p.totalAmount);
        String? trend;
        bool up = true;
        if (points.length >= 2) {
          final last = points[points.length - 1].totalAmount;
          final prev = points[points.length - 2].totalAmount;
          if (prev > 0) {
            final pct = ((last - prev) / prev) * 100;
            up = pct >= 0;
            trend = '${up ? '▲' : '▼'} ${pct.abs().toStringAsFixed(1)}%';
          }
        }
        return _kpiTile(label, _compact(total), trend: trend, trendUp: up, points: points, color: color);
      },
    );
  }

  Widget _kpiTile(
    String label,
    String value, {
    String? subtitle,
    String? trend,
    bool trendUp = true,
    List<MonthlyGraphPoint>? points,
    Color color = _teal400,
  }) {
    return SizedBox(
      width: 230,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
              if (trend != null) ...[
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: (trendUp ? _teal600 : const Color(0xFFA32D2D)).withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    trend,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: trendUp ? _teal600 : const Color(0xFFA32D2D),
                    ),
                  ),
                ),
              ],
              if (subtitle != null)
                Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              if (points != null && points.length >= 2) ...[
                const SizedBox(height: 6),
                SizedBox(height: 26, child: _Sparkline(points: points, color: color)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Sparkline extends StatelessWidget {
  const _Sparkline({required this.points, required this.color});
  final List<MonthlyGraphPoint> points;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return LineChart(
      LineChartData(
        lineTouchData: const LineTouchData(enabled: false),
        titlesData: const FlTitlesData(show: false),
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: [for (var i = 0; i < points.length; i++) FlSpot(i.toDouble(), points[i].totalAmount)],
            isCurved: true,
            color: color,
            barWidth: 2,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(show: true, color: color.withValues(alpha: 0.10)),
          ),
        ],
      ),
    );
  }
}

// ---- Category donut ----

class _CategoryDonutCard extends ConsumerStatefulWidget {
  const _CategoryDonutCard();

  @override
  ConsumerState<_CategoryDonutCard> createState() => _CategoryDonutCardState();
}

class _CategoryDonutCardState extends ConsumerState<_CategoryDonutCard> {
  // Legend entries the user has toggled off — the donut + centre total exclude these live.
  final Set<int> _hidden = {};

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(categorySalesProvider);
    return _Card(
      title: 'Category mix',
      child: async.when(
        loading: () => const SizedBox(height: 120, child: Center(child: CircularProgressIndicator())),
        error: (e, _) => Text('Could not load: $e'),
        data: (cats) {
          final sorted = [...cats]..sort((a, b) => b.totalAmount.compareTo(a.totalAmount));
          final top = sorted.take(5).toList();
          final grandTotal = top.fold(0.0, (a, c) => a + c.totalAmount);
          if (grandTotal <= 0) return const SizedBox(height: 100, child: Center(child: Text('No sales data yet.')));
          final shownTotal = [
            for (var i = 0; i < top.length; i++)
              if (!_hidden.contains(i)) top[i].totalAmount,
          ].fold(0.0, (a, b) => a + b);
          return Row(
            children: [
              SizedBox(
                width: 120,
                height: 120,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    PieChart(
                      PieChartData(
                        centerSpaceRadius: 34,
                        sectionsSpace: 2,
                        sections: [
                          for (var i = 0; i < top.length; i++)
                            PieChartSectionData(
                              // A hidden slice collapses to a sliver in a faded tint.
                              value: _hidden.contains(i) ? 0.0001 : top[i].totalAmount,
                              color: _hidden.contains(i)
                                  ? _donutColors[i % _donutColors.length].withValues(alpha: 0.12)
                                  : _donutColors[i % _donutColors.length],
                              radius: 22,
                              showTitle: false,
                            ),
                        ],
                      ),
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Sales', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                        Text(_compact(shownTotal), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (var i = 0; i < top.length; i++)
                      InkWell(
                        onTap: () => setState(() => _hidden.contains(i) ? _hidden.remove(i) : _hidden.add(i)),
                        borderRadius: BorderRadius.circular(4),
                        child: Opacity(
                          opacity: _hidden.contains(i) ? 0.4 : 1,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 3),
                            child: Row(
                              children: [
                                Container(width: 10, height: 10, decoration: BoxDecoration(color: _donutColors[i % _donutColors.length], borderRadius: BorderRadius.circular(2))),
                                const SizedBox(width: 6),
                                Expanded(child: Text(top[i].categoryName, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis)),
                                Text('${(top[i].totalAmount / grandTotal * 100).toStringAsFixed(0)}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ---- Stock health gauge ----

class _StockHealthCard extends ConsumerWidget {
  const _StockHealthCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summary = ref.watch(dashboardSummaryProvider);
    final lowStock = ref.watch(lowStockItemsProvider);
    return _Card(
      title: 'Stock health',
      child: summary.when(
        loading: () => const SizedBox(height: 150, child: Center(child: CircularProgressIndicator())),
        error: (e, _) => Text('Could not load: $e'),
        data: (s) {
          final active = s.quickStats.activeProducts;
          final low = lowStock.whenOrNull(data: (rows) => rows.length) ?? 0;
          final inStock = (active - low).clamp(0, active);
          final rate = active > 0 ? inStock / active : 0.0;
          final pct = (rate * 100).round();
          final color = pct >= 80
              ? _teal600
              : pct >= 60
                  ? const Color(0xFFB8860B)
                  : const Color(0xFFA32D2D);
          return Column(
            children: [
              SizedBox(
                height: 110,
                width: 180,
                child: CustomPaint(
                  painter: _GaugePainter(rate, color),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('$pct%', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: color)),
                        const Text('fill rate', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _dot(_teal600),
                  Text(' $inStock in stock   ', style: const TextStyle(fontSize: 12, color: Color(0xFF475569))),
                  _dot(const Color(0xFFA32D2D)),
                  Text(' $low low', style: const TextStyle(fontSize: 12, color: Color(0xFF475569))),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _dot(Color c) => Container(width: 8, height: 8, decoration: BoxDecoration(color: c, shape: BoxShape.circle));
}

/// A 180° top-half arc gauge (background track + coloured value arc).
class _GaugePainter extends CustomPainter {
  _GaugePainter(this.value, this.color);
  final double value; // 0..1
  final Color color;

  static const double _pi = 3.1415926535;

  @override
  void paint(Canvas canvas, Size size) {
    const stroke = 13.0;
    final center = Offset(size.width / 2, size.height - 6);
    final radius = (size.width / 2) - stroke / 2 - 2;
    final rect = Rect.fromCircle(center: center, radius: radius);
    final track = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFFE2E8F0);
    final fill = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..color = color;
    canvas.drawArc(rect, _pi, _pi, false, track);
    canvas.drawArc(rect, _pi, _pi * value.clamp(0.0, 1.0), false, fill);
  }

  @override
  bool shouldRepaint(covariant _GaugePainter old) => old.value != value || old.color != color;
}

// ---- Top products bars ----

class _TopProductsCard extends ConsumerWidget {
  const _TopProductsCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(topSellingItemsProvider);
    return _Card(
      title: 'Top products by revenue',
      child: async.when(
        loading: () => const SizedBox(height: 120, child: Center(child: CircularProgressIndicator())),
        error: (e, _) => Text('Could not load: $e'),
        data: (items) {
          final sorted = [...items]..sort((a, b) => b.totalSalesAmount.compareTo(a.totalSalesAmount));
          final top = sorted.take(5).toList();
          if (top.isEmpty) return const SizedBox(height: 100, child: Center(child: Text('No sales data yet.')));
          final max = top.first.totalSalesAmount;
          return Column(
            children: [
              for (final p in top)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 5),
                  child: Row(
                    children: [
                      SizedBox(width: 130, child: Text(p.productName, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: LinearProgressIndicator(
                            value: max > 0 ? p.totalSalesAmount / max : 0,
                            minHeight: 10,
                            backgroundColor: const Color(0xFFEEF2F6),
                            valueColor: const AlwaysStoppedAnimation(_teal400),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(_compact(p.totalSalesAmount), style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

// ---- Receivables aging ----

class _ReceivablesAgingCard extends ConsumerWidget {
  const _ReceivablesAgingCard();

  static const _buckets = [
    ('Current', Color(0xFF639922)),
    ('1–30d', Color(0xFFC0DD97)),
    ('31–60d', Color(0xFFEF9F27)),
    ('61–90d', Color(0xFFD85A30)),
    ('90d+', Color(0xFFE24B4A)),
  ];

  int _bucketIndex(num days) {
    if (days <= 0) return 0;
    if (days <= 30) return 1;
    if (days <= 60) return 2;
    if (days <= 90) return 3;
    return 4;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(receivablesProvider);
    return _Card(
      title: 'Receivables aging',
      child: async.when(
        loading: () => const SizedBox(height: 80, child: Center(child: CircularProgressIndicator())),
        error: (e, _) => Text('Could not load: $e'),
        data: (rows) {
          final totals = List<double>.filled(5, 0);
          for (final r in rows) {
            totals[_bucketIndex((r['daysOverdue'] as num?) ?? 0)] += (r['outstandingAmount'] as num?)?.toDouble() ?? 0;
          }
          final grand = totals.fold(0.0, (a, b) => a + b);
          if (grand <= 0) return const SizedBox(height: 60, child: Center(child: Text('Nothing outstanding.')));
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: SizedBox(
                  height: 22,
                  child: Row(
                    children: [
                      for (var i = 0; i < 5; i++)
                        if (totals[i] > 0)
                          Expanded(flex: (totals[i] * 1000 / grand).round().clamp(1, 1000), child: Container(color: _buckets[i].$2)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 12,
                runSpacing: 4,
                children: [
                  for (var i = 0; i < 5; i++)
                    if (totals[i] > 0)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(width: 10, height: 10, decoration: BoxDecoration(color: _buckets[i].$2, borderRadius: BorderRadius.circular(2))),
                          const SizedBox(width: 4),
                          Text('${_buckets[i].$1} ${_compact(totals[i])}', style: const TextStyle(fontSize: 12)),
                        ],
                      ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

