import 'package:flutter/material.dart';
import 'field_spec.dart';
import 'presentation/fk_picker_field.dart';

/// `batchId` is the one FK in the app whose target list isn't a fixed resource — product
/// batches only exist nested under a specific product (`/products/:productId/batches`), and
/// which product a line/entry refers to is chosen by the user at the same time. Builds a
/// [FieldSpec] on the fly once [productId] is known (so [FkPickerField] can point at that
/// product's own batch list) and shows a disabled placeholder until then.
Widget productScopedBatchField({
  required BuildContext context,
  required String? productId,
  required String? value,
  required ValueChanged<String?> onChanged,
}) {
  if (productId == null) {
    return InputDecorator(
      decoration: const InputDecoration(
        labelText: 'Batch (optional)',
        border: OutlineInputBorder(),
        helperText: 'Select a product first',
      ),
      child: Text('—', style: TextStyle(color: Theme.of(context).hintColor)),
    );
  }

  final field = FieldSpec(
    key: 'batchId',
    label: 'Batch (optional)',
    type: FieldType.dropdownFk,
    fkResource: 'products/$productId/batches',
    fkLabelKey: 'batchNumber',
  );
  return FkPickerField(field: field, value: value, onChanged: onChanged);
}
