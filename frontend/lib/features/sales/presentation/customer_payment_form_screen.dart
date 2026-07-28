import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/field_widget_builder.dart';

const customerPaymentResourcePath = 'sales/customer-payments';

const _paymentModeValues = ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'];
const _paymentModeLabels = {
  'cash': 'Cash',
  'bank_transfer': 'Bank transfer',
  'cheque': 'Cheque',
  'upi': 'UPI',
  'card': 'Card',
  'other': 'Other',
};

const _headerFields = [
  FieldSpec(key: 'customerId', label: 'Customer', type: FieldType.dropdownFk, required: true, fkResource: 'customers'),
  FieldSpec(key: 'amount', label: 'Amount', type: FieldType.decimal, required: true),
  FieldSpec(key: 'paymentMode', label: 'Payment mode', type: FieldType.enumSelect, required: true, enumValues: _paymentModeValues, enumLabels: _paymentModeLabels),
  FieldSpec(key: 'paymentDate', label: 'Payment date', type: FieldType.date),
  FieldSpec(key: 'referenceNumber', label: 'Reference number', type: FieldType.text, maxLength: 60),
  FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
];

const _allocationFields = [
  FieldSpec(key: 'salesInvoiceId', label: 'Sales invoice', type: FieldType.dropdownFk, required: true, fkResource: 'sales/sales-invoices', fkLabelKey: 'invoiceNumber'),
  FieldSpec(key: 'allocatedAmount', label: 'Allocated amount', type: FieldType.decimal, required: true),
];

class _AllocationEntry {
  final Key key = UniqueKey();
  final Map<String, dynamic> values = {};
}

/// Mirrors `SupplierPaymentFormScreen` exactly (Phase 10e) — a payment posts + allocates
/// atomically in one create call, no draft state, no approve/delete route at all.
class CustomerPaymentFormScreen extends ConsumerStatefulWidget {
  const CustomerPaymentFormScreen({super.key});

  @override
  ConsumerState<CustomerPaymentFormScreen> createState() => _CustomerPaymentFormScreenState();
}

class _CustomerPaymentFormScreenState extends ConsumerState<CustomerPaymentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _headerValues = {};
  final List<_AllocationEntry> _allocations = [_AllocationEntry()];
  bool _submitting = false;
  String? _error;

  void _addAllocation() => setState(() => _allocations.add(_AllocationEntry()));

  void _removeAllocation(_AllocationEntry entry) => setState(() => _allocations.remove(entry));

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _allocations.isEmpty) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    final body = {
      ...coerceFieldValues(_headerFields, _headerValues),
      'allocations': [for (final entry in _allocations) coerceFieldValues(_allocationFields, entry.values)],
    };
    try {
      await ref.read(genericCrudApiProvider(customerPaymentResourcePath)).create(body);
      ref.invalidate(entityListProvider(customerPaymentResourcePath));
      if (!mounted) return;
      Navigator.of(context).pop();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Customer Payment')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.onErrorContainer)),
                    ),
                  ),
                for (final field in _headerFields) ...[
                  buildFieldWidget(
                    context: context,
                    field: field,
                    value: _headerValues[field.key],
                    onChanged: (v) => setState(() => _headerValues[field.key] = v),
                  ),
                  const SizedBox(height: 16),
                ],
                Text('Allocations', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                for (final entry in _allocations)
                  Card(
                    key: entry.key,
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          for (final field in _allocationFields) ...[
                            buildFieldWidget(
                              context: context,
                              field: field,
                              value: entry.values[field.key],
                              onChanged: (v) => setState(() => entry.values[field.key] = v),
                            ),
                            const SizedBox(height: 12),
                          ],
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton.icon(
                              onPressed: _allocations.length > 1 ? () => _removeAllocation(entry) : null,
                              icon: const Icon(Icons.delete_outline),
                              label: const Text('Remove allocation'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                OutlinedButton.icon(onPressed: _addAllocation, icon: const Icon(Icons.add), label: const Text('Add allocation')),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _submitting ? null : _submit,
                  child: _submitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Create'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
