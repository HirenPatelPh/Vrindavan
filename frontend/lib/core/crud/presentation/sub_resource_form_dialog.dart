import 'package:flutter/material.dart';
import '../field_spec.dart';
import '../field_widget_builder.dart';

/// A small `AlertDialog` form for creating/editing a record via a fixed [FieldSpec] list — used
/// by Product's nested-resource tabs (Units/Batches/Barcodes), which are too capability-varied
/// (multipart uploads, no-update, read-only) to share [GenericFormScreen]'s full page, but still
/// want the same field-type-to-widget mapping and client-side validation.
///
/// Returns the submitted values map, or null if the dialog was cancelled.
Future<Map<String, dynamic>?> showSubResourceFormDialog(
  BuildContext context, {
  required String title,
  required List<FieldSpec> fields,
  Map<String, dynamic>? initial,
}) {
  final formKey = GlobalKey<FormState>();
  final values = <String, dynamic>{...?initial};
  if (initial == null) {
    for (final field in fields) {
      if (field.defaultValue != null) values[field.key] = field.defaultValue;
    }
  }

  return showDialog<Map<String, dynamic>>(
    context: context,
    builder: (dialogContext) => StatefulBuilder(
      builder: (dialogContext, setState) => AlertDialog(
        title: Text(title),
        content: SizedBox(
          width: 420,
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final field in fields) ...[
                    buildFieldWidget(
                      context: dialogContext,
                      field: field,
                      value: values[field.key],
                      onChanged: (v) => setState(() => values[field.key] = v),
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(dialogContext, values);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    ),
  );
}
