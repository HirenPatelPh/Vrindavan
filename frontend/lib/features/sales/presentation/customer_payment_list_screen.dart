import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import 'customer_payment_form_screen.dart';

const _paymentModeLabels = {
  'cash': 'Cash',
  'bank_transfer': 'Bank transfer',
  'cheque': 'Cheque',
  'upi': 'UPI',
  'card': 'Card',
  'other': 'Other',
};

/// Mirrors `SupplierPaymentListScreen` (Phase 10e) — no status column, no action affordance;
/// payments are single-shot and never mutated after creation.
class CustomerPaymentListScreen extends ConsumerWidget {
  const CustomerPaymentListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recordsAsync = ref.watch(entityListProvider(customerPaymentResourcePath));
    final customersAsync = ref.watch(entityListProvider('customers'));

    String customerName(String? id) {
      if (id == null) return '—';
      return customersAsync.maybeWhen(
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
      appBar: AppBar(title: const Text('Customer Payments')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/$customerPaymentResourcePath/new'),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(entityListProvider(customerPaymentResourcePath)),
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
                  subtitle: Text('${customerName(record['customerId'] as String?)} · ₹${record['amount']} · $mode · $date'),
                  onTap: () => context.push('/$customerPaymentResourcePath/${record['id']}'),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
