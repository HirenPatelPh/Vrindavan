import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/format_helpers.dart';

const _priceTypeLabels = {'purchase': 'Purchase price', 'selling': 'Selling price', 'mrp': 'MRP'};

/// Fully read-only — no create/update/delete endpoints exist for this resource at all. Rows are
/// written exclusively by a Postgres trigger (`trg_track_price_history`) whenever a product's
/// `purchase_price`/`selling_price`/`mrp` changes via `PATCH /products/:id`; the app never
/// writes here directly.
class ProductPriceHistoryTab extends ConsumerWidget {
  const ProductPriceHistoryTab({required this.productId, super.key});

  final String productId;

  String get _resourcePath => 'products/$productId/price-history';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(entityListProvider(_resourcePath));

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(entityListProvider(_resourcePath)),
      child: historyAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load price history: $e')),
        data: (rows) {
          if (rows.isEmpty) {
            return ListView(
              children: const [Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No price changes yet.')))],
            );
          }
          return ListView.separated(
            itemCount: rows.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final row = rows[index];
              final oldPrice = row['oldPrice'];
              return ListTile(
                title: Text(_priceTypeLabels[row['priceType']] ?? row['priceType']?.toString() ?? ''),
                subtitle: Text('${oldPrice != null ? '₹$oldPrice → ' : ''}₹${row['newPrice']}'),
                trailing: Text(orDash(row['changedAt']?.toString().split('T').first)),
              );
            },
          );
        },
      ),
    );
  }
}
