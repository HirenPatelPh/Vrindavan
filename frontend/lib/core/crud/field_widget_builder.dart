import 'package:flutter/material.dart';
import 'field_spec.dart';
import 'presentation/fk_picker_field.dart';

/// Builds the input widget for one [FieldSpec] — shared by [GenericFormScreen] and any other
/// form surface driven by [FieldSpec] (e.g. the Product sub-resource dialogs), so the
/// field-type-to-widget mapping only needs to be proven once.
Widget buildFieldWidget({
  required BuildContext context,
  required FieldSpec field,
  required dynamic value,
  required ValueChanged<dynamic> onChanged,
}) {
  switch (field.type) {
    case FieldType.boolean:
      return SwitchListTile(
        title: Text(field.label),
        value: (value as bool?) ?? false,
        onChanged: onChanged,
      );
    case FieldType.enumSelect:
      return DropdownButtonFormField<String>(
        initialValue: value as String?,
        decoration: InputDecoration(labelText: field.label, border: const OutlineInputBorder()),
        items: field.enumValues!.map((v) => DropdownMenuItem(value: v, child: Text(field.displayLabel(v)))).toList(),
        onChanged: onChanged,
        validator: (v) => field.validate(v),
      );
    case FieldType.dropdownFk:
      return FkPickerField(field: field, value: value as String?, onChanged: onChanged);
    case FieldType.date:
      final current = value as String?;
      return TextFormField(
        key: ValueKey('${field.key}_$current'),
        initialValue: current,
        readOnly: true,
        decoration: InputDecoration(
          labelText: field.label,
          border: const OutlineInputBorder(),
          suffixIcon: const Icon(Icons.calendar_today),
        ),
        validator: (v) => field.validate(v),
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: current != null ? DateTime.tryParse(current) ?? DateTime.now() : DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
          );
          if (picked != null) onChanged(picked.toIso8601String().split('T').first);
        },
      );
    case FieldType.text:
    case FieldType.longText:
    case FieldType.email:
    case FieldType.url:
    case FieldType.integer:
    case FieldType.decimal:
      return TextFormField(
        initialValue: value?.toString(),
        decoration: InputDecoration(labelText: field.label, border: const OutlineInputBorder()),
        maxLines: field.type == FieldType.longText ? 3 : 1,
        keyboardType: field.type == FieldType.integer || field.type == FieldType.decimal
            ? const TextInputType.numberWithOptions(decimal: true)
            : TextInputType.text,
        validator: (v) => field.validate(v),
        onChanged: onChanged,
      );
  }
}

/// Converts a raw `{fieldKey: rawFormValue}` map into a JSON-ready request body: parses
/// integer/decimal fields to actual numbers and drops blank values (letting server-side
/// defaults apply) — shared by [GenericFormScreen] and the Product sub-resource dialogs.
Map<String, dynamic> coerceFieldValues(List<FieldSpec> fields, Map<String, dynamic> raw) {
  final body = <String, dynamic>{};
  for (final field in fields) {
    final value = raw[field.key];
    if (value == null || (value is String && value.isEmpty)) continue;
    switch (field.type) {
      case FieldType.integer:
        body[field.key] = int.parse(value.toString());
      case FieldType.decimal:
        body[field.key] = num.parse(value.toString());
      default:
        body[field.key] = value;
    }
  }
  return body;
}
