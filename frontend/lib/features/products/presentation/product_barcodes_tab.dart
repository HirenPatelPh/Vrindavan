import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/field_widget_builder.dart';
import '../../../core/crud/presentation/sub_resource_form_dialog.dart';

const _barcodeTypeValues = ['ean13', 'code128', 'qr', 'upc', 'other'];
const _barcodeTypeLabels = {
  'ean13': 'EAN-13',
  'code128': 'Code 128',
  'qr': 'QR code',
  'upc': 'UPC',
  'other': 'Other',
};

/// Additional barcodes beyond the single `products.barcode` column — optionally scoped to a
/// specific unit variant (e.g. the box's own barcode) via `productUnitId`. Create + delete only
/// — the backend has no update route for this resource. The `productUnitId` picker needs a
/// two-hop label (product_units row -> its unitId -> the unit's name), which the generic
/// `FkPickerField` can't derive on its own (unit-variant rows carry no display name field of
/// their own) — resolved via [FieldSpec.fkLabelBuilder].
class ProductBarcodesTab extends ConsumerWidget {
  const ProductBarcodesTab({required this.productId, super.key});

  final String productId;

  String get _resourcePath => 'products/$productId/barcodes';
  String get _unitsResourcePath => 'products/$productId/units';

  Future<void> _add(BuildContext context, WidgetRef ref, List<FieldSpec> fields) async {
    final result = await showSubResourceFormDialog(context, title: 'Add barcode', fields: fields);
    if (result == null) return;
    try {
      await ref.read(genericCrudApiProvider(_resourcePath)).create(coerceFieldValues(fields, result));
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
    final barcodesAsync = ref.watch(entityListProvider(_resourcePath));
    final unitRowsAsync = ref.watch(entityListProvider(_unitsResourcePath));
    final allUnitsAsync = ref.watch(entityListProvider('units'));

    String unitVariantLabel(Map<String, dynamic> row) {
      final unitId = row['unitId'];
      final unitName = allUnitsAsync.maybeWhen(
        data: (units) {
          for (final u in units) {
            if (u['id'] == unitId) return u['name']?.toString();
          }
          return null;
        },
        orElse: () => null,
      );
      return unitName ?? 'Unit variant';
    }

    String? resolveUnitLabel(String? productUnitId) {
      if (productUnitId == null) return null;
      return unitRowsAsync.maybeWhen(
        data: (rows) {
          for (final row in rows) {
            if (row['id'] == productUnitId) return unitVariantLabel(row);
          }
          return null;
        },
        orElse: () => null,
      );
    }

    final fields = [
      const FieldSpec(key: 'barcode', label: 'Barcode', type: FieldType.text, required: true, maxLength: 50),
      const FieldSpec(
        key: 'barcodeType',
        label: 'Type',
        type: FieldType.enumSelect,
        enumValues: _barcodeTypeValues,
        enumLabels: _barcodeTypeLabels,
        defaultValue: 'ean13',
      ),
      FieldSpec(
        key: 'productUnitId',
        label: 'Unit variant (optional)',
        type: FieldType.dropdownFk,
        fkResource: _unitsResourcePath,
        fkLabelBuilder: unitVariantLabel,
      ),
      const FieldSpec(key: 'isPrimary', label: 'Primary barcode', type: FieldType.boolean, defaultValue: false),
    ];

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _add(context, ref, fields),
        icon: const Icon(Icons.add),
        label: const Text('Add barcode'),
      ),
      body: barcodesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load barcodes: $e')),
        data: (rows) {
          if (rows.isEmpty) return const Center(child: Text('No additional barcodes yet.'));
          return ListView.separated(
            padding: const EdgeInsets.only(bottom: 88),
            itemCount: rows.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final row = rows[index];
              final unitLabel = resolveUnitLabel(row['productUnitId'] as String?);
              final isPrimary = row['isPrimary'] as bool? ?? false;
              return ListTile(
                title: Text(row['barcode']?.toString() ?? ''),
                subtitle: Text(
                  '${_barcodeTypeLabels[row['barcodeType']] ?? row['barcodeType']}'
                  '${unitLabel != null ? ' · $unitLabel' : ''}'
                  '${isPrimary ? ' · Primary' : ''}',
                ),
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
