import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/presentation/fk_picker_field.dart';
import '../../../core/crud/product_unit_field.dart';
import '../../../core/providers/core_providers.dart';
import '../specs/quotation_spec.dart';

const _resourcePath = 'sales/quotations';

/// Hand-written rather than `DocumentDetailScreen` — Quotation's lifecycle is
/// `send`/`accept`/`reject`/`convert-to-sales-order`, not a single approve action, and
/// `convert-to-sales-order` uniquely takes an input (`warehouseId`) and produces a *different*
/// resource (a new Sales Order) rather than changing this one's status. List/create still reuse
/// the generic `DocumentListScreen`/`DocumentFormScreen` via `quotationSpec` — only this detail
/// screen is bespoke.
class QuotationDetailScreen extends ConsumerStatefulWidget {
  const QuotationDetailScreen({required this.quotationId, super.key});

  final String quotationId;

  @override
  ConsumerState<QuotationDetailScreen> createState() => _QuotationDetailScreenState();
}

class _QuotationDetailScreenState extends ConsumerState<QuotationDetailScreen> {
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
      final data = await ref.read(genericCrudApiProvider(_resourcePath)).getOne(widget.quotationId);
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

  Future<void> _runAction(String route) async {
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).post('/$_resourcePath/${widget.quotationId}/$route');
      ref.invalidate(entityListProvider(_resourcePath));
      await _load();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Delete "${_record?['quotationNumber']}"?'),
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
      await ref.read(genericCrudApiProvider(_resourcePath)).delete(widget.quotationId);
      ref.invalidate(entityListProvider(_resourcePath));
      if (!mounted) return;
      context.pop();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _busy = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _convertToSalesOrder() async {
    const warehouseField = FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses');
    String? warehouseId;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setState) => AlertDialog(
          title: const Text('Convert to Sales Order'),
          content: SizedBox(
            width: 360,
            child: FkPickerField(field: warehouseField, value: warehouseId, onChanged: (v) => setState(() => warehouseId = v)),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(
              onPressed: warehouseId == null ? null : () => Navigator.pop(dialogContext, true),
              child: const Text('Convert'),
            ),
          ],
        ),
      ),
    );
    if (confirmed != true || warehouseId == null || !mounted) return;
    setState(() => _busy = true);
    try {
      final salesOrder = await ref
          .read(apiClientProvider)
          .post('/$_resourcePath/${widget.quotationId}/convert-to-sales-order', data: {'warehouseId': warehouseId});
      ref.invalidate(entityListProvider(_resourcePath));
      if (!mounted) return;
      context.push('/sales/sales-orders/${(salesOrder as Map<String, dynamic>)['id']}');
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String? _resolveFkName(String resourcePath, String? id) {
    if (id == null) return null;
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

  Widget _lineTile(Map<String, dynamic> line) {
    final parts = <String>[];
    for (final field in quotationSpec.lineFields) {
      final raw = line[field.key];
      if (raw == null || (raw is String && raw.isEmpty)) continue;
      String display;
      if (field.key == 'productUnitId') {
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
    final lines = (record['lines'] as List? ?? []).cast<Map<String, dynamic>>();
    final customerName = _resolveFkName('customers', record['customerId'] as String?);

    final actions = <Widget>[];
    if (status == 'draft') {
      actions.add(IconButton(tooltip: 'Delete', icon: const Icon(Icons.delete_outline), onPressed: _busy ? null : _delete));
      actions.add(_actionButton('Send', () => _runAction('send')));
    } else if (status == 'sent') {
      actions.add(OutlinedButton(onPressed: _busy ? null : () => _runAction('reject'), child: const Text('Reject')));
      actions.add(const SizedBox(width: 12));
      actions.add(_actionButton('Accept', () => _runAction('accept')));
    } else if (status == 'accepted') {
      actions.add(_actionButton('Convert to Sales Order', _convertToSalesOrder));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(record['quotationNumber']?.toString() ?? 'Quotation'),
        actions: [...actions, const SizedBox(width: 12)],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 24,
            runSpacing: 12,
            children: [
              _InfoItem(label: 'Customer', value: customerName ?? 'Loading…'),
              _InfoItem(label: 'Quotation date', value: record['quotationDate']?.toString().split('T').first ?? '—'),
              _InfoItem(label: 'Valid until', value: record['validUntil']?.toString().split('T').first ?? '—'),
              _InfoItem(label: 'Total', value: '₹${record['totalAmount'] ?? 0}'),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Status', style: Theme.of(context).textTheme.labelMedium),
                  Chip(label: Text(status), visualDensity: VisualDensity.compact),
                ],
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

  Widget _actionButton(String label, VoidCallback onPressed) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: FilledButton(
        onPressed: _busy ? null : onPressed,
        child: _busy
            ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
            : Text(label),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  const _InfoItem({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelMedium),
          Text(value, style: Theme.of(context).textTheme.titleSmall),
        ],
      ),
    );
  }
}
