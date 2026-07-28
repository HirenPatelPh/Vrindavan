import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/api_exception.dart';
import '../application/generic_crud_providers.dart';
import '../entity_spec.dart';
import '../field_widget_builder.dart';

class GenericFormScreen extends ConsumerStatefulWidget {
  const GenericFormScreen({required this.spec, this.recordId, this.initialData, super.key});

  final EntitySpec spec;

  /// Non-null when editing an existing record.
  final String? recordId;

  /// Pre-fetched record passed via the list screen's row tap — avoids a redundant GET. If null
  /// while [recordId] is set (e.g. a web page refresh lost the router `extra`), the record is
  /// fetched by id instead.
  final Map<String, dynamic>? initialData;

  bool get isEditing => recordId != null;

  @override
  ConsumerState<GenericFormScreen> createState() => _GenericFormScreenState();
}

class _GenericFormScreenState extends ConsumerState<GenericFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _values = {};
  bool _loading = false;
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.initialData != null) {
      _values.addAll(widget.initialData!);
    } else if (widget.isEditing) {
      _loading = true;
      _loadRecord();
    } else {
      for (final field in widget.spec.formFields) {
        if (field.defaultValue != null) _values[field.key] = field.defaultValue;
      }
    }
  }

  Future<void> _loadRecord() async {
    try {
      final data = await ref.read(genericCrudApiProvider(widget.spec.resourcePath)).getOne(widget.recordId!);
      if (!mounted) return;
      setState(() {
        _values.addAll(data);
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    setState(() {
      _submitting = true;
      _error = null;
    });
    final api = ref.read(genericCrudApiProvider(widget.spec.resourcePath));
    final body = coerceFieldValues(widget.spec.formFields, _values);
    try {
      if (widget.isEditing) {
        await api.update(widget.recordId!, body);
      } else {
        await api.create(body);
      }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isEditing ? 'Edit ${widget.spec.title}' : 'New ${widget.spec.title}')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
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
                            child: Text(
                              _error!,
                              style: TextStyle(color: Theme.of(context).colorScheme.onErrorContainer),
                            ),
                          ),
                        ),
                      for (final field in widget.spec.formFields) ...[
                        buildFieldWidget(
                          context: context,
                          field: field,
                          value: _values[field.key],
                          onChanged: (v) => setState(() => _values[field.key] = v),
                        ),
                        const SizedBox(height: 16),
                      ],
                      FilledButton(
                        onPressed: _submitting ? null : _submit,
                        child: _submitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(widget.isEditing ? 'Save' : 'Create'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
