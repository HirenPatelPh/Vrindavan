import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/presentation/fk_picker_field.dart';
import '../../../core/providers/core_providers.dart';

const _customerFilterField = FieldSpec(key: 'customerId', label: 'Customer (all)', type: FieldType.dropdownFk, fkResource: 'customers');

/// Mirrors `OutstandingPayablesScreen` (Phase 10e) — read-only report backed by
/// `v_outstanding_receivables`, already fully denormalized (`invoiceNumber`/`customerName`), no
/// FK resolution needed. Only `approved`/`partially_paid` invoices with a remaining balance ever
/// appear.
class OutstandingReceivablesScreen extends ConsumerStatefulWidget {
  const OutstandingReceivablesScreen({super.key});

  @override
  ConsumerState<OutstandingReceivablesScreen> createState() => _OutstandingReceivablesScreenState();
}

class _OutstandingReceivablesScreenState extends ConsumerState<OutstandingReceivablesScreen> {
  String? _customerId;
  Future<List<Map<String, dynamic>>>? _future;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  void _fetch() {
    setState(() {
      _future = ref
          .read(apiClientProvider)
          .get('/sales/outstanding-receivables', queryParameters: {if (_customerId != null) 'customerId': _customerId})
          .then((data) => (data as List).cast<Map<String, dynamic>>());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Outstanding Receivables')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: FkPickerField(
                    field: _customerFilterField,
                    value: _customerId,
                    onChanged: (v) {
                      _customerId = v;
                      _fetch();
                    },
                  ),
                ),
                if (_customerId != null)
                  IconButton(
                    tooltip: 'Clear filter',
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _customerId = null;
                      _fetch();
                    },
                  ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  final error = snapshot.error;
                  final message = error is ApiException ? error.message : error.toString();
                  return Center(child: Text('Could not load data: $message'));
                }
                final rows = snapshot.data ?? [];
                if (rows.isEmpty) return const Center(child: Text('No outstanding receivables.'));
                return ListView.separated(
                  itemCount: rows.length,
                  separatorBuilder: (_, _) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final row = rows[index];
                    final daysOverdue = (row['daysOverdue'] as num?) ?? 0;
                    final dueDate = row['dueDate']?.toString().split('T').first ?? '—';
                    return ListTile(
                      title: Text('${row['invoiceNumber']} · ${row['customerName']}'),
                      subtitle: Text('Due: $dueDate · Total: ₹${row['totalAmount']} · Paid: ₹${row['paidAmount']}'),
                      trailing: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('₹${row['outstandingAmount']}', style: Theme.of(context).textTheme.titleSmall),
                          if (daysOverdue > 0)
                            Text('$daysOverdue days overdue', style: TextStyle(color: Colors.red.shade700, fontSize: 12)),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
