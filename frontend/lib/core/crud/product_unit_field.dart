import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'application/generic_crud_providers.dart';
import 'field_spec.dart';
import 'presentation/fk_picker_field.dart';

String? _unitNameFor(WidgetRef ref, dynamic unitId) {
  if (unitId == null) return null;
  final async = ref.watch(entityListProvider('units'));
  return async.maybeWhen(
    data: (units) {
      for (final u in units) {
        if (u['id'] == unitId) return u['name']?.toString();
      }
      return null;
    },
    orElse: () => null,
  );
}

/// `productUnitId` is one hop deeper than [productBatchField]'s `batchId`: a product's own
/// `/units` rows (Phase 10c) carry no display name of their own, only a `unitId` FK to the
/// global `units` resource — so resolving a label needs both the product-scoped unit list AND
/// the global unit-name list, hence this needs [WidgetRef] rather than being a plain function.
Widget productScopedUnitField({
  required BuildContext context,
  required WidgetRef ref,
  required String? productId,
  required String? value,
  required ValueChanged<String?> onChanged,
}) {
  if (productId == null) {
    return InputDecorator(
      decoration: const InputDecoration(labelText: 'Unit', border: OutlineInputBorder(), helperText: 'Select a product first'),
      child: Text('—', style: TextStyle(color: Theme.of(context).hintColor)),
    );
  }

  String labelFor(Map<String, dynamic> record) => _unitNameFor(ref, record['unitId']) ?? 'Unit variant';

  final field = FieldSpec(
    key: 'productUnitId',
    label: 'Unit',
    type: FieldType.dropdownFk,
    required: true,
    fkResource: 'products/$productId/units',
    fkLabelBuilder: labelFor,
  );
  return FkPickerField(field: field, value: value, onChanged: onChanged);
}

/// Read-only mirror of [productScopedUnitField]'s resolution, for detail-screen display.
String? resolveProductUnitName(WidgetRef ref, String? productId, String? productUnitId) {
  if (productId == null || productUnitId == null) return productUnitId;
  final async = ref.watch(entityListProvider('products/$productId/units'));
  return async.maybeWhen(
    data: (rows) {
      for (final row in rows) {
        if (row['id'] == productUnitId) return _unitNameFor(ref, row['unitId']) ?? productUnitId;
      }
      return productUnitId;
    },
    orElse: () => null,
  );
}
