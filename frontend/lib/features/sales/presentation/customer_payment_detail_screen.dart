import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import 'customer_payment_form_screen.dart';

/// Mirrors `SupplierPaymentDetailScreen` (Phase 10e) — read-only, no actions.
class CustomerPaymentDetailScreen extends ConsumerStatefulWidget {
  const CustomerPaymentDetailScreen({required this.paymentId, super.key});

  final String paymentId;

  @override
  ConsumerState<CustomerPaymentDetailScreen> createState() => _CustomerPaymentDetailScreenState();
}

class _CustomerPaymentDetailScreenState extends ConsumerState<CustomerPaymentDetailScreen> {
  Map<String, dynamic>? _record;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ref.read(genericCrudApiProvider(customerPaymentResourcePath)).getOne(widget.paymentId);
      if (!mounted) return;
      setState(() {
        _record = data;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  String? _resolveFkName(String resourcePath, String? id, {String labelKey = 'name'}) {
    if (id == null) return null;
    final async = ref.watch(entityListProvider(resourcePath));
    return async.maybeWhen(
      data: (records) {
        for (final r in records) {
          if (r['id'] == id) return r[labelKey]?.toString() ?? id;
        }
        return id;
      },
      orElse: () => null,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null || _record == null) {
      return Scaffold(body: Center(child: Text(_error ?? 'Not found')));
    }

    final record = _record!;
    final allocations = (record['allocations'] as List? ?? []).cast<Map<String, dynamic>>();
    final customerName = _resolveFkName('customers', record['customerId'] as String?);

    return Scaffold(
      appBar: AppBar(title: Text(record['paymentNumber']?.toString() ?? 'Customer Payment')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 24,
            runSpacing: 12,
            children: [
              _InfoItem(label: 'Customer', value: customerName ?? 'Loading…'),
              _InfoItem(label: 'Amount', value: '₹${record['amount']}'),
              _InfoItem(label: 'Payment mode', value: record['paymentMode']?.toString() ?? ''),
              _InfoItem(label: 'Date', value: record['paymentDate']?.toString().split('T').first ?? '—'),
              _InfoItem(label: 'Reference', value: (record['referenceNumber'] as String?)?.isNotEmpty == true ? record['referenceNumber'] : '—'),
            ],
          ),
          const Divider(height: 32),
          Text('Allocations', style: Theme.of(context).textTheme.titleMedium),
          for (final allocation in allocations)
            ListTile(
              title: Text(
                _resolveFkName('sales/sales-invoices', allocation['salesInvoiceId'] as String?, labelKey: 'invoiceNumber') ?? 'Loading…',
              ),
              trailing: Text('₹${allocation['allocatedAmount']}'),
            ),
        ],
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  const _InfoItem({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelMedium),
          Text(value, style: Theme.of(context).textTheme.titleSmall),
        ],
      ),
    );
  }
}
