import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/providers/core_providers.dart';
import 'blocked_stock_form_screen.dart';

String? _nameOf(AsyncValue<List<Map<String, dynamic>>> async, String? id) {
  if (id == null) return null;
  return async.maybeWhen(
    data: (records) {
      for (final r in records) {
        if (r['id'] == id) return r['name']?.toString() ?? id;
      }
      return id;
    },
    orElse: () => null,
  );
}

/// Direct-entry resource — no delete route exists at all, only create and a `.../release`
/// action, so (unlike [GenericListScreen]) there is no delete affordance here.
class BlockedStockListScreen extends ConsumerWidget {
  const BlockedStockListScreen({super.key});

  Future<void> _release(BuildContext context, WidgetRef ref, String id) async {
    try {
      await ref.read(apiClientProvider).post('/$blockedStockResourcePath/$id/release');
      ref.invalidate(entityListProvider(blockedStockResourcePath));
    } on ApiException catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recordsAsync = ref.watch(entityListProvider(blockedStockResourcePath));
    final productsAsync = ref.watch(entityListProvider('products'));
    final warehousesAsync = ref.watch(entityListProvider('warehouses'));

    return Scaffold(
      appBar: AppBar(title: const Text('Blocked Stock')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/$blockedStockResourcePath/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(entityListProvider(blockedStockResourcePath)),
        child: recordsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Could not load data: $e')),
          data: (records) {
            if (records.isEmpty) {
              return ListView(
                children: const [Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No records yet.')))],
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.only(bottom: 88),
              itemCount: records.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final record = records[index];
                final status = record['status']?.toString() ?? '';
                final product = _nameOf(productsAsync, record['productId'] as String?) ?? 'Loading…';
                final warehouse = _nameOf(warehousesAsync, record['warehouseId'] as String?) ?? 'Loading…';
                return ListTile(
                  title: Text(product),
                  subtitle: Text('$warehouse · Qty: ${record['quantity']} · ${record['reason']} · $status'),
                  trailing: status == 'blocked'
                      ? OutlinedButton(onPressed: () => _release(context, ref, record['id'] as String), child: const Text('Release'))
                      : null,
                );
              },
            );
          },
        ),
      ),
    );
  }
}
