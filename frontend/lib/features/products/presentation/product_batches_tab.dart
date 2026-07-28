import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/field_widget_builder.dart';
import '../../../core/crud/format_helpers.dart';
import '../../../core/crud/presentation/sub_resource_form_dialog.dart';

String _shortDate(dynamic value) {
  final str = value?.toString();
  if (str == null || str.isEmpty) return '—';
  return str.contains('T') ? str.split('T').first : str;
}

const _batchFields = [
  FieldSpec(key: 'batchNumber', label: 'Batch number', type: FieldType.text, required: true, maxLength: 60),
  FieldSpec(key: 'lotNumber', label: 'Lot number', type: FieldType.text, maxLength: 60),
  FieldSpec(key: 'manufacturingDate', label: 'Manufacturing date', type: FieldType.date),
  FieldSpec(key: 'expiryDate', label: 'Expiry date', type: FieldType.date),
];

/// Pure label/metadata rows (batch number, lot number, mfg/expiry dates) — no quantity field;
/// actual quantities live in `stock_ledger` from the Inventory phase, keyed by this batch's id.
/// Full CRUD, nested under `/products/:productId/batches`.
class ProductBatchesTab extends ConsumerWidget {
  const ProductBatchesTab({required this.productId, super.key});

  final String productId;

  String get _resourcePath => 'products/$productId/batches';

  Future<void> _add(BuildContext context, WidgetRef ref) async {
    final result = await showSubResourceFormDialog(context, title: 'Add batch', fields: _batchFields);
    if (result == null) return;
    try {
      await ref.read(genericCrudApiProvider(_resourcePath)).create(coerceFieldValues(_batchFields, result));
      ref.invalidate(entityListProvider(_resourcePath));
    } on ApiException catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _edit(BuildContext context, WidgetRef ref, Map<String, dynamic> record) async {
    final result = await showSubResourceFormDialog(
      context,
      title: 'Edit batch',
      fields: _batchFields,
      initial: record,
    );
    if (result == null) return;
    try {
      await ref
          .read(genericCrudApiProvider(_resourcePath))
          .update(record['id'] as String, coerceFieldValues(_batchFields, result));
      ref.invalidate(entityListProvider(_resourcePath));
    } on ApiException catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _delete(BuildContext context, WidgetRef ref, String id) async {
    try {
      await ref.read(genericCrudApiProvider(_resourcePath)).delete(id);
      ref.invalidate(entityListProvider(_resourcePath));
    } on ApiException catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final batchesAsync = ref.watch(entityListProvider(_resourcePath));

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _add(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Add batch'),
      ),
      body: batchesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load batches: $e')),
        data: (rows) {
          if (rows.isEmpty) return const Center(child: Text('No batches yet.'));
          return ListView.separated(
            padding: const EdgeInsets.only(bottom: 88),
            itemCount: rows.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final row = rows[index];
              return ListTile(
                title: Text(row['batchNumber']?.toString() ?? ''),
                subtitle: Text(
                  'Lot: ${orDash(row['lotNumber'])} · Mfg: ${_shortDate(row['manufacturingDate'])} · '
                  'Expiry: ${_shortDate(row['expiryDate'])}',
                ),
                onTap: () => _edit(context, ref, row),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline),
                  tooltip: 'Delete',
                  onPressed: () => _delete(context, ref, row['id'] as String),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
