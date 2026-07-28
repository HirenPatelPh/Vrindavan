import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/field_widget_builder.dart';
import '../../../core/crud/presentation/sub_resource_form_dialog.dart';

const _unitFields = [
  FieldSpec(
    key: 'unitId',
    label: 'Unit',
    type: FieldType.dropdownFk,
    required: true,
    fkResource: 'units',
    fkCodeKey: 'shortCode',
  ),
  FieldSpec(
    key: 'conversionFactor',
    label: '1 of this unit = factor × base unit',
    type: FieldType.decimal,
    required: true,
  ),
  FieldSpec(key: 'isBaseUnit', label: 'Is base unit', type: FieldType.boolean, defaultValue: false),
  FieldSpec(key: 'purchasePrice', label: 'Purchase price', type: FieldType.decimal),
  FieldSpec(key: 'sellingPrice', label: 'Selling price', type: FieldType.decimal),
  FieldSpec(key: 'barcode', label: 'Barcode', type: FieldType.text, maxLength: 50),
];

/// Alternate sellable/purchasable unit variants for a product (e.g. Piece/Box/Bag), each with
/// its own conversion factor back to the product's base unit. Full CRUD, just nested under
/// `/products/:productId/units` — [GenericCrudApi] works unmodified since it's just a
/// resourcePath string.
class ProductUnitsTab extends ConsumerWidget {
  const ProductUnitsTab({required this.productId, super.key});

  final String productId;

  String get _resourcePath => 'products/$productId/units';

  Future<void> _add(BuildContext context, WidgetRef ref) async {
    final result = await showSubResourceFormDialog(context, title: 'Add unit', fields: _unitFields);
    if (result == null) return;
    try {
      await ref.read(genericCrudApiProvider(_resourcePath)).create(coerceFieldValues(_unitFields, result));
      ref.invalidate(entityListProvider(_resourcePath));
    } on ApiException catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _edit(BuildContext context, WidgetRef ref, Map<String, dynamic> record) async {
    final result = await showSubResourceFormDialog(context, title: 'Edit unit', fields: _unitFields, initial: record);
    if (result == null) return;
    try {
      await ref
          .read(genericCrudApiProvider(_resourcePath))
          .update(record['id'] as String, coerceFieldValues(_unitFields, result));
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
    final unitsAsync = ref.watch(entityListProvider(_resourcePath));
    final allUnitsAsync = ref.watch(entityListProvider('units'));

    String unitName(String? unitId) {
      if (unitId == null) return '—';
      return allUnitsAsync.maybeWhen(
        data: (units) {
          for (final u in units) {
            if (u['id'] == unitId) return '${u['name']} (${u['shortCode']})';
          }
          return unitId;
        },
        orElse: () => unitId,
      );
    }

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _add(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Add unit'),
      ),
      body: unitsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load units: $e')),
        data: (rows) {
          if (rows.isEmpty) return const Center(child: Text('No alternate units yet.'));
          return ListView.separated(
            padding: const EdgeInsets.only(bottom: 88),
            itemCount: rows.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final row = rows[index];
              final isBase = row['isBaseUnit'] as bool? ?? false;
              return ListTile(
                title: Text(unitName(row['unitId'] as String?)),
                subtitle: Text(
                  'Factor: ${row['conversionFactor']}'
                  '${isBase ? ' · Base unit' : ''}'
                  '${row['barcode'] != null ? ' · Barcode: ${row['barcode']}' : ''}',
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
