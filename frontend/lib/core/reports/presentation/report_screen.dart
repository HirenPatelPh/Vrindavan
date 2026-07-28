import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../api/api_exception.dart';
import '../../crud/field_spec.dart';
import '../../crud/field_widget_builder.dart';
import '../../providers/core_providers.dart';
import '../report_spec.dart';

String _isoDate(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

const _fromDateField = FieldSpec(key: 'fromDate', label: 'From date', type: FieldType.date, required: true);
const _toDateField = FieldSpec(key: 'toDate', label: 'To date', type: FieldType.date, required: true);

/// Generic report screen driven by a [ReportSpec] — required date range + optional extra
/// filters + a "Run report" button fetching a flat array (already `{data: ...}`-unwrapped by the
/// existing [ApiClient.get], same as every other read-only report in this app) into a
/// horizontally-scrollable [DataTable].
class ReportScreen extends ConsumerStatefulWidget {
  const ReportScreen({required this.spec, super.key});

  final ReportSpec spec;

  @override
  ConsumerState<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends ConsumerState<ReportScreen> {
  late final Map<String, dynamic> _filterValues;
  Future<List<Map<String, dynamic>>>? _future;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _filterValues = {
      'fromDate': _isoDate(DateTime(now.year, now.month, 1)),
      'toDate': _isoDate(now),
    };
    _run();
  }

  void _run() {
    final query = <String, dynamic>{
      'fromDate': _filterValues['fromDate'],
      'toDate': _filterValues['toDate'],
    };
    for (final field in widget.spec.extraFilters) {
      final value = _filterValues[field.key];
      if (value != null && (value is! String || value.isNotEmpty)) query[field.key] = value;
    }
    setState(() {
      _future = ref
          .read(apiClientProvider)
          .get('/${widget.spec.resourcePath}', queryParameters: query)
          .then((data) => (data as List).cast<Map<String, dynamic>>());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.spec.title)),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              crossAxisAlignment: WrapCrossAlignment.end,
              children: [
                SizedBox(
                  width: 200,
                  child: buildFieldWidget(
                    context: context,
                    field: _fromDateField,
                    value: _filterValues['fromDate'],
                    onChanged: (v) => setState(() => _filterValues['fromDate'] = v),
                  ),
                ),
                SizedBox(
                  width: 200,
                  child: buildFieldWidget(
                    context: context,
                    field: _toDateField,
                    value: _filterValues['toDate'],
                    onChanged: (v) => setState(() => _filterValues['toDate'] = v),
                  ),
                ),
                for (final field in widget.spec.extraFilters)
                  SizedBox(
                    width: 240,
                    child: buildFieldWidget(
                      context: context,
                      field: field,
                      value: _filterValues[field.key],
                      onChanged: (v) => setState(() => _filterValues[field.key] = v),
                    ),
                  ),
                FilledButton(onPressed: _run, child: const Text('Run report')),
              ],
            ),
          ),
          const Divider(height: 1),
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
                  return Center(child: Text('Could not load report: $message'));
                }
                final rows = snapshot.data ?? [];
                if (rows.isEmpty) return const Center(child: Text('No data for this range.'));
                return SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SingleChildScrollView(
                    child: DataTable(
                      showCheckboxColumn: false,
                      columns: [for (final column in widget.spec.columns) DataColumn(label: Text(column.label))],
                      rows: [
                        for (final row in rows)
                          DataRow(
                            onSelectChanged: widget.spec.rowRoute == null ? null : (_) => context.push(widget.spec.rowRoute!(row)),
                            cells: [for (final column in widget.spec.columns) DataCell(Text(column.format(row)))],
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
