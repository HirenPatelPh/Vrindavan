import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/api_exception.dart';
import '../../crud/application/generic_crud_providers.dart';
import '../../crud/field_spec.dart';
import '../../crud/field_widget_builder.dart';
import '../../crud/product_batch_field.dart';
import '../../crud/product_unit_field.dart';
import '../document_spec.dart';

class _LineEntry {
  final Key key = UniqueKey();
  final Map<String, dynamic> values = {};
}

class DocumentFormScreen extends ConsumerStatefulWidget {
  const DocumentFormScreen({required this.spec, super.key});

  final DocumentSpec spec;

  @override
  ConsumerState<DocumentFormScreen> createState() => _DocumentFormScreenState();
}

class _DocumentFormScreenState extends ConsumerState<DocumentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _headerValues = {};
  final List<_LineEntry> _lines = [_LineEntry()];
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    for (final field in widget.spec.headerFields) {
      if (field.defaultValue != null) _headerValues[field.key] = field.defaultValue;
    }
  }

  void _addLine() => setState(() => _lines.add(_LineEntry()));

  void _removeLine(_LineEntry line) => setState(() => _lines.remove(line));

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _lines.isEmpty) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    final body = {
      ...coerceFieldValues(widget.spec.headerFields, _headerValues),
      'lines': [for (final line in _lines) coerceFieldValues(widget.spec.lineFields, line.values)],
    };
    try {
      await ref.read(genericCrudApiProvider(widget.spec.resourcePath)).create(body);
      ref.invalidate(entityListProvider(widget.spec.resourcePath));
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

  Widget _lineField(_LineEntry line, FieldSpec field) {
    if (field.key == 'batchId' && field.type == FieldType.dropdownFk) {
      return productScopedBatchField(
        context: context,
        productId: line.values['productId'] as String?,
        value: line.values['batchId'] as String?,
        onChanged: (v) => setState(() => line.values['batchId'] = v),
      );
    }
    if (field.key == 'productUnitId' && field.type == FieldType.dropdownFk) {
      return productScopedUnitField(
        context: context,
        ref: ref,
        productId: line.values['productId'] as String?,
        value: line.values['productUnitId'] as String?,
        onChanged: (v) => setState(() => line.values['productUnitId'] = v),
      );
    }
    return buildFieldWidget(
      context: context,
      field: field,
      value: line.values[field.key],
      onChanged: (v) => setState(() => line.values[field.key] = v),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('New ${widget.spec.title}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
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
                for (final field in widget.spec.headerFields) ...[
                  buildFieldWidget(
                    context: context,
                    field: field,
                    value: _headerValues[field.key],
                    onChanged: (v) => setState(() => _headerValues[field.key] = v),
                  ),
                  const SizedBox(height: 16),
                ],
                Text('Lines', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                for (final line in _lines)
                  Card(
                    key: line.key,
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          for (final field in widget.spec.lineFields) ...[
                            _lineField(line, field),
                            const SizedBox(height: 12),
                          ],
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton.icon(
                              onPressed: _lines.length > 1 ? () => _removeLine(line) : null,
                              icon: const Icon(Icons.delete_outline),
                              label: const Text('Remove line'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                OutlinedButton.icon(
                  onPressed: _addLine,
                  icon: const Icon(Icons.add),
                  label: const Text('Add line'),
                ),
                const SizedBox(height: 24),
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
