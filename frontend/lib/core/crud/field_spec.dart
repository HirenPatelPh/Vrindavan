enum FieldType { text, longText, integer, decimal, boolean, email, url, date, enumSelect, dropdownFk }

/// Describes one form field for the generic CRUD engine — enough to both render the right
/// input widget and validate client-side using the same constraints as the backend's
/// `create-*.dto.ts` (see each EntitySpec for the source). The server's `ValidationPipe` is
/// still the source of truth; this only fails fast before a round-trip.
class FieldSpec {
  const FieldSpec({
    required this.key,
    required this.label,
    required this.type,
    this.required = false,
    this.maxLength,
    this.defaultValue,
    this.enumValues,
    this.enumLabels,
    this.fkResource,
    this.fkLabelKey,
    this.fkCodeKey,
    this.fkLabelBuilder,
  }) : assert(
         type != FieldType.enumSelect || enumValues != null,
         'enumSelect fields must supply enumValues',
       ),
       assert(type != FieldType.dropdownFk || fkResource != null, 'dropdownFk fields must supply fkResource');

  final String key;
  final String label;
  final FieldType type;
  final bool required;
  final int? maxLength;

  /// Pre-filled value on the create form (e.g. `isActive: true`).
  final Object? defaultValue;

  /// Raw values for [FieldType.enumSelect] (e.g. backend enum strings like `'gst'`).
  final List<String>? enumValues;

  /// Optional display label per enum value; falls back to the raw value if absent.
  final Map<String, String>? enumLabels;

  /// Resource path of the referenced module for [FieldType.dropdownFk] (e.g. `'branches'`).
  final String? fkResource;

  /// Field on the referenced record to display — defaults to `'name'`.
  final String? fkLabelKey;

  /// Field on the referenced record to show alongside the label — defaults to `'code'`.
  final String? fkCodeKey;

  /// Escape hatch for [FieldType.dropdownFk] targets whose records have no natural display
  /// name (e.g. a product's own unit-variant rows, which only carry a `unitId` FK of their
  /// own) — when set, takes priority over [fkLabelKey]/[fkCodeKey] for both the closed field's
  /// label and the picker sheet's rows.
  final String Function(Map<String, dynamic> record)? fkLabelBuilder;

  String displayLabel(String enumValue) => enumLabels?[enumValue] ?? enumValue;

  /// Client-side validation mirroring the backend DTO constraints. Returns null when valid.
  String? validate(Object? value) {
    final isBlank = value == null || (value is String && value.trim().isEmpty);
    if (required && isBlank) return '$label is required';
    if (isBlank) return null;

    switch (type) {
      case FieldType.text:
      case FieldType.longText:
        final str = value as String;
        if (maxLength != null && str.length > maxLength!) return '$label must be at most $maxLength characters';
        return null;
      case FieldType.email:
        final str = value as String;
        if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(str)) return 'Enter a valid email';
        return null;
      case FieldType.url:
        final uri = Uri.tryParse(value as String);
        if (uri == null || !uri.hasScheme) return 'Enter a valid URL';
        return null;
      case FieldType.integer:
        if (int.tryParse(value.toString()) == null) return '$label must be a whole number';
        return null;
      case FieldType.decimal:
        if (num.tryParse(value.toString()) == null) return '$label must be a number';
        return null;
      case FieldType.boolean:
      case FieldType.date:
      case FieldType.enumSelect:
      case FieldType.dropdownFk:
        return null;
    }
  }
}
