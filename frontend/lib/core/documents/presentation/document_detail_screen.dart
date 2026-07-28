import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_exception.dart';
import '../../crud/application/generic_crud_providers.dart';
import '../../crud/field_spec.dart';
import '../../crud/product_unit_field.dart';
import '../../providers/core_providers.dart';
import '../document_spec.dart';

/// `'totalAmount'` -> `'Total Amount'`, for [DocumentSpec.summaryFields] labels.
String _humanize(String camelCase) {
  final withSpaces = camelCase.replaceAllMapped(RegExp('([a-z0-9])([A-Z])'), (m) => '${m[1]} ${m[2]}');
  return withSpaces[0].toUpperCase() + withSpaces.substring(1);
}

/// Shows one document (header + resolved FK names + lines) with Approve/Complete, an optional
/// Cancel, and Delete actions — which statuses make each visible is driven by
/// [DocumentSpec.approveFromStatuses]/[DocumentSpec.cancelFromStatuses]; Delete is always
/// draft-only (uniform across every document type built so far).
class DocumentDetailScreen extends ConsumerStatefulWidget {
  const DocumentDetailScreen({required this.spec, required this.documentId, super.key});

  final DocumentSpec spec;
  final String documentId;

  @override
  ConsumerState<DocumentDetailScreen> createState() => _DocumentDetailScreenState();
}

class _DocumentDetailScreenState extends ConsumerState<DocumentDetailScreen> {
  Map<String, dynamic>? _record;
  bool _loading = true;
  String? _error;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ref.read(genericCrudApiProvider(widget.spec.resourcePath)).getOne(widget.documentId);
      if (!mounted) return;
      setState(() {
        _record = data;
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

  Future<void> _approve() async {
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).post('/${widget.spec.resourcePath}/${widget.documentId}/${widget.spec.approveRoute}');
      ref.invalidate(entityListProvider(widget.spec.resourcePath));
      await _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      await _showActionError(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _cancel() async {
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).post('/${widget.spec.resourcePath}/${widget.documentId}/${widget.spec.cancelRoute}');
      ref.invalidate(entityListProvider(widget.spec.resourcePath));
      await _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      await _showActionError(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  /// Lifecycle actions (approve/cancel) can fail on real business rules — e.g. approving a stock
  /// transfer whose source warehouse lacks the stock. Show those in a dismissable dialog rather
  /// than a fleeting SnackBar, so the reason is unmissable (a SnackBar reads as "nothing
  /// happened").
  Future<void> _showActionError(String message) {
    return showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Action failed'),
        content: Text(message),
        actions: [TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('OK'))],
      ),
    );
  }

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Delete "${_record?[widget.spec.numberKey]}"?'),
        content: const Text('This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(genericCrudApiProvider(widget.spec.resourcePath)).delete(widget.documentId);
      ref.invalidate(entityListProvider(widget.spec.resourcePath));
      if (!mounted) return;
      context.pop();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _busy = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  String? _resolveFkName(String resourcePath, String id) {
    final async = ref.watch(entityListProvider(resourcePath));
    return async.maybeWhen(
      data: (records) {
        for (final r in records) {
          if (r['id'] == id) return r['name']?.toString() ?? id;
        }
        return id;
      },
      orElse: () => null,
    );
  }

  String? _resolveBatchName(String? productId, String batchId) {
    if (productId == null) return batchId;
    final async = ref.watch(entityListProvider('products/$productId/batches'));
    return async.maybeWhen(
      data: (records) {
        for (final r in records) {
          if (r['id'] == batchId) return r['batchNumber']?.toString() ?? batchId;
        }
        return batchId;
      },
      orElse: () => null,
    );
  }

  String _headerValueText(FieldSpec field, Map<String, dynamic> record) {
    final raw = record[field.key];
    if (raw == null || (raw is String && raw.isEmpty)) return '—';
    if (field.type == FieldType.dropdownFk) return _resolveFkName(field.fkResource!, raw as String) ?? 'Loading…';
    if (field.type == FieldType.date) return raw.toString().split('T').first;
    return raw.toString();
  }

  Widget _lineTile(Map<String, dynamic> line) {
    final parts = <String>[];
    for (final field in widget.spec.lineFields) {
      final raw = line[field.key];
      if (raw == null || (raw is String && raw.isEmpty)) continue;
      String display;
      if (field.key == 'batchId') {
        display = _resolveBatchName(line['productId'] as String?, raw as String) ?? 'Loading…';
      } else if (field.key == 'productUnitId') {
        display = resolveProductUnitName(ref, line['productId'] as String?, raw as String) ?? 'Loading…';
      } else if (field.type == FieldType.dropdownFk) {
        display = _resolveFkName(field.fkResource!, raw as String) ?? 'Loading…';
      } else {
        display = raw.toString();
      }
      parts.add('${field.label}: $display');
    }
    return ListTile(title: Text(parts.join(' · ')));
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null || _record == null) {
      return Scaffold(body: Center(child: Text(_error ?? 'Not found')));
    }

    final record = _record!;
    final status = record['status']?.toString() ?? '';
    final canApprove = widget.spec.approveRoute != null && widget.spec.approveFromStatuses.contains(status);
    final canCancel = widget.spec.cancelRoute != null && widget.spec.cancelFromStatuses.contains(status);
    final canDelete = status == 'draft';
    final lines = (record['lines'] as List? ?? []).cast<Map<String, dynamic>>();

    return Scaffold(
      appBar: AppBar(
        title: Text(record[widget.spec.numberKey]?.toString() ?? widget.spec.title),
        actions: [
          if (canDelete)
            IconButton(
              tooltip: 'Delete',
              icon: const Icon(Icons.delete_outline),
              onPressed: _busy ? null : _delete,
            ),
          if (canCancel)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: OutlinedButton(
                onPressed: _busy ? null : _cancel,
                child: Text(widget.spec.cancelLabel ?? 'Cancel'),
              ),
            ),
          if (canApprove)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: FilledButton(
                onPressed: _busy ? null : _approve,
                child: _busy
                    ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(widget.spec.approveLabel ?? 'Approve'),
              ),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 24,
            runSpacing: 12,
            children: [
              for (final field in widget.spec.headerFields)
                SizedBox(
                  width: 220,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(field.label, style: Theme.of(context).textTheme.labelMedium),
                      Text(_headerValueText(field, record)),
                    ],
                  ),
                ),
              SizedBox(
                width: 220,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Status', style: Theme.of(context).textTheme.labelMedium),
                    Chip(label: Text(status), visualDensity: VisualDensity.compact),
                  ],
                ),
              ),
              for (final key in widget.spec.summaryFields)
                SizedBox(
                  width: 220,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_humanize(key), style: Theme.of(context).textTheme.labelMedium),
                      Text('₹${record[key] ?? 0}', style: Theme.of(context).textTheme.titleSmall),
                    ],
                  ),
                ),
            ],
          ),
          const Divider(height: 32),
          Text('Lines', style: Theme.of(context).textTheme.titleMedium),
          for (final line in lines) _lineTile(line),
        ],
      ),
    );
  }
}
