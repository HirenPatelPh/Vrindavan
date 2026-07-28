import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/field_widget_builder.dart';
import '../../../core/crud/product_batch_field.dart';

const blockedStockResourcePath = 'inventory/blocked-stock';

const _fields = [
  FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
  FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
  FieldSpec(key: 'rackId', label: 'Rack (optional)', type: FieldType.dropdownFk, fkResource: 'racks'),
  FieldSpec(key: 'locationId', label: 'Location (optional)', type: FieldType.dropdownFk, fkResource: 'locations'),
  FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
  FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
  FieldSpec(key: 'reason', label: 'Reason', type: FieldType.text, required: true, maxLength: 500),
];

/// Direct-entry create form — Blocked Stock has no update/delete routes at all, only create and
/// a `.../release` action (handled from the list screen), so this form is create-only.
class BlockedStockFormScreen extends ConsumerStatefulWidget {
  const BlockedStockFormScreen({super.key});

  @override
  ConsumerState<BlockedStockFormScreen> createState() => _BlockedStockFormScreenState();
}

class _BlockedStockFormScreenState extends ConsumerState<BlockedStockFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _values = {};
  bool _submitting = false;
  String? _error;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    final body = coerceFieldValues(_fields, _values);
    try {
      await ref.read(genericCrudApiProvider(blockedStockResourcePath)).create(body);
      ref.invalidate(entityListProvider(blockedStockResourcePath));
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

  Widget _field(FieldSpec field) {
    if (field.key == 'batchId') {
      return productScopedBatchField(
        context: context,
        productId: _values['productId'] as String?,
        value: _values['batchId'] as String?,
        onChanged: (v) => setState(() => _values['batchId'] = v),
      );
    }
    return buildFieldWidget(
      context: context,
      field: field,
      value: _values[field.key],
      onChanged: (v) => setState(() => _values[field.key] = v),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Blocked Stock')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
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
                for (final field in _fields) ...[_field(field), const SizedBox(height: 16)],
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
