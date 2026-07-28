import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import 'supplier_payment_form_screen.dart';

const _paymentModeLabels = {
  'cash': 'Cash',
  'bank_transfer': 'Bank transfer',
  'cheque': 'Cheque',
  'upi': 'UPI',
  'card': 'Card',
  'other': 'Other',
};

/// Payments are single-shot: create + allocate atomically, no draft state, no approve/delete
/// route at all (confirmed against the backend — `supplier_payments` isn't in the seed's
/// `approvable_modules` and has no delete route either). So unlike `DocumentListScreen` there's
/// no status column and no action affordance — just a plain list, row tap opens the read-only
/// detail (allocation breakdown), FAB creates a new one.
class SupplierPaymentListScreen extends ConsumerWidget {
  const SupplierPaymentListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recordsAsync = ref.watch(entityListProvider(supplierPaymentResourcePath));
    final suppliersAsync = ref.watch(entityListProvider('suppliers'));

    String supplierName(String? id) {
      if (id == null) return '—';
      return suppliersAsync.maybeWhen(
        data: (records) {
          for (final r in records) {
            if (r['id'] == id) return r['name']?.toString() ?? id;
          }
          return id;
        },
        orElse: () => 'Loading…',
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Supplier Payments')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/$supplierPaymentResourcePath/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(entityListProvider(supplierPaymentResourcePath)),
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
                final date = record['paymentDate']?.toString().split('T').first ?? '';
                final mode = _paymentModeLabels[record['paymentMode']] ?? record['paymentMode']?.toString() ?? '';
                return ListTile(
                  title: Text(record['paymentNumber']?.toString() ?? ''),
                  subtitle: Text('${supplierName(record['supplierId'] as String?)} · ₹${record['amount']} · $mode · $date'),
                  onTap: () => context.push('/$supplierPaymentResourcePath/${record['id']}'),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
