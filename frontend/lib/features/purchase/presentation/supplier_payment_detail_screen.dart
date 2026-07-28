import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import 'supplier_payment_form_screen.dart';

/// Read-only — nothing to approve, cancel, or delete, so unlike `DocumentDetailScreen` this has
/// no action buttons at all. Just shows the header plus which invoices this payment was split
/// across.
class SupplierPaymentDetailScreen extends ConsumerStatefulWidget {
  const SupplierPaymentDetailScreen({required this.paymentId, super.key});

  final String paymentId;

  @override
  ConsumerState<SupplierPaymentDetailScreen> createState() => _SupplierPaymentDetailScreenState();
}

class _SupplierPaymentDetailScreenState extends ConsumerState<SupplierPaymentDetailScreen> {
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
      final data = await ref.read(genericCrudApiProvider(supplierPaymentResourcePath)).getOne(widget.paymentId);
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
    final supplierName = _resolveFkName('suppliers', record['supplierId'] as String?);

    return Scaffold(
      appBar: AppBar(title: Text(record['paymentNumber']?.toString() ?? 'Supplier Payment')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 24,
            runSpacing: 12,
            children: [
              _InfoItem(label: 'Supplier', value: supplierName ?? 'Loading…'),
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
                _resolveFkName('purchase/purchase-invoices', allocation['purchaseInvoiceId'] as String?, labelKey: 'invoiceNumber') ?? 'Loading…',
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
