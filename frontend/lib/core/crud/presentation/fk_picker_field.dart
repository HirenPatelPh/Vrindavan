import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../application/generic_crud_providers.dart';
import '../field_spec.dart';

/// A [FormField]-integrated picker for [FieldType.dropdownFk] fields: opens a search-filterable
/// bottom sheet listing the referenced resource's full list (there's no server-side filtering
/// by parent to lean on — every list endpoint returns everything, see EntitySpec docs) and
/// returns the picked id.
class FkPickerField extends ConsumerWidget {
  const FkPickerField({required this.field, required this.value, required this.onChanged, super.key});

  final FieldSpec field;
  final String? value;
  final ValueChanged<String?> onChanged;

  String _label(Map<String, dynamic> record) {
    if (field.fkLabelBuilder != null) return field.fkLabelBuilder!(record);
    final label = record[field.fkLabelKey ?? 'name']?.toString() ?? record['id'].toString();
    final code = record[field.fkCodeKey ?? 'code']?.toString();
    return (code == null || code.isEmpty) ? label : '$label ($code)';
  }

  Map<String, dynamic>? _findById(List<Map<String, dynamic>> records, String? id) {
    if (id == null) return null;
    for (final record in records) {
      if (record['id'] == id) return record;
    }
    return null;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recordsAsync = ref.watch(entityListProvider(field.fkResource!));

    return FormField<String>(
      initialValue: value,
      validator: field.validate,
      builder: (state) {
        final currentLabel = recordsAsync.maybeWhen(
          data: (records) {
            final match = _findById(records, state.value);
            return match == null ? null : _label(match);
          },
          orElse: () => null,
        );
        final isReady = recordsAsync.hasValue;
        return InkWell(
          onTap: !isReady
              ? null
              : () async {
                  final records = recordsAsync.value!;
                  final picked = await showModalBottomSheet<String>(
                    context: context,
                    isScrollControlled: true,
                    builder: (_) => _FkPickerSheet(records: records, labelBuilder: _label),
                  );
                  if (picked != null) {
                    state.didChange(picked);
                    onChanged(picked);
                  }
                },
          child: InputDecorator(
            decoration: InputDecoration(
              labelText: field.label,
              border: const OutlineInputBorder(),
              errorText: state.errorText,
              suffixIcon: const Icon(Icons.arrow_drop_down),
            ),
            child: Text(
              currentLabel ?? (isReady ? 'Select…' : 'Loading…'),
              style: currentLabel == null ? TextStyle(color: Theme.of(context).hintColor) : null,
            ),
          ),
        );
      },
    );
  }
}

class _FkPickerSheet extends StatefulWidget {
  const _FkPickerSheet({required this.records, required this.labelBuilder});

  final List<Map<String, dynamic>> records;
  final String Function(Map<String, dynamic>) labelBuilder;

  @override
  State<_FkPickerSheet> createState() => _FkPickerSheetState();
}

class _FkPickerSheetState extends State<_FkPickerSheet> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = _query.isEmpty
        ? widget.records
        : widget.records.where((r) => widget.labelBuilder(r).toLowerCase().contains(_query.toLowerCase())).toList();

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                autofocus: true,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Search',
                  border: OutlineInputBorder(),
                ),
                onChanged: (v) => setState(() => _query = v),
              ),
            ),
            Expanded(
              child: filtered.isEmpty
                  ? const Center(child: Text('No matches'))
                  : ListView.builder(
                      controller: scrollController,
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final record = filtered[index];
                        return ListTile(
                          title: Text(widget.labelBuilder(record)),
                          onTap: () => Navigator.pop(context, record['id'] as String),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
