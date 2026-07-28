import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pluto_grid/pluto_grid.dart';
import '../../crud/application/generic_crud_providers.dart';
import '../../crud/field_spec.dart';
import '../../providers/core_providers.dart';
import '../document_spec.dart';

const _pageSizeOptions = [12, 20, 50, 100];
const _visibleRows = 12;

class _Page {
  const _Page({required this.items, required this.total});
  final List<Map<String, dynamic>> items;
  final int total;
}

/// List screen for the draft→approve document types. When [DocumentSpec.pageSize] is set it
/// renders a paginated [PlutoGrid] (number / date / money / status columns) matching the
/// Products screen; otherwise it falls back to the original `ListTile` list. Delete/edit are
/// intentionally absent from the row (delete is draft-only, on the detail screen) — the row
/// action is Open.
class DocumentListScreen extends ConsumerStatefulWidget {
  const DocumentListScreen({required this.spec, super.key});

  final DocumentSpec spec;

  @override
  ConsumerState<DocumentListScreen> createState() => _DocumentListScreenState();
}

class _DocumentListScreenState extends ConsumerState<DocumentListScreen> {
  int _pageNumber = 1;
  late int _pageSize;
  Future<_Page>? _pageFuture;

  @override
  void initState() {
    super.initState();
    _pageSize = widget.spec.pageSize ?? _pageSizeOptions.first;
    if (widget.spec.pageSize != null) _fetchPage();
  }

  String? _dateKey() {
    for (final field in widget.spec.headerFields) {
      if (field.type == FieldType.date) return field.key;
    }
    return null;
  }

  String _humanize(String key) {
    final spaced = key.replaceAllMapped(RegExp('([A-Z])'), (m) => ' ${m[1]}');
    return spaced.isEmpty ? key : spaced[0].toUpperCase() + spaced.substring(1);
  }

  void _fetchPage() {
    setState(() {
      _pageFuture = ref
          .read(apiClientProvider)
          .get('/${widget.spec.resourcePath}', queryParameters: {'page': _pageNumber, 'limit': _pageSize})
          .then((data) {
            if (data is Map<String, dynamic> && data.containsKey('items')) {
              return _Page(items: (data['items'] as List).cast<Map<String, dynamic>>(), total: data['total'] as int);
            }
            final all = (data as List).cast<Map<String, dynamic>>();
            final start = (_pageNumber - 1) * _pageSize;
            return _Page(items: all.skip(start).take(_pageSize).toList(), total: all.length);
          });
    });
  }

  void _refreshAfterReturn() {
    if (widget.spec.pageSize != null) {
      _fetchPage();
    } else {
      ref.invalidate(entityListProvider(widget.spec.resourcePath));
    }
  }

  void _openDetail(Map<String, dynamic> record) {
    context.push('/${widget.spec.resourcePath}/${record['id']}').then((_) => _refreshAfterReturn());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.spec.title)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/${widget.spec.resourcePath}/new').then((_) => _refreshAfterReturn()),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: widget.spec.pageSize != null ? _buildPaginated() : _buildList(),
    );
  }

  Widget _buildList() {
    final recordsAsync = ref.watch(entityListProvider(widget.spec.resourcePath));
    final dateKey = _dateKey();
    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(entityListProvider(widget.spec.resourcePath)),
      child: recordsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load data: $e')),
        data: (records) {
          if (records.isEmpty) {
            return ListView(
              children: const [Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No records yet.')))],
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.only(bottom: 88),
            itemCount: records.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final record = records[index];
              final status = record['status']?.toString() ?? '';
              final date = dateKey != null ? record[dateKey]?.toString().split('T').first : null;
              return ListTile(
                title: Text(record[widget.spec.numberKey]?.toString() ?? ''),
                subtitle: Text([?date, 'Status: $status'].join(' · ')),
                onTap: () => context.push('/${widget.spec.resourcePath}/${record['id']}'),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildPaginated() {
    return FutureBuilder<_Page>(
      future: _pageFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) return Center(child: Text('Could not load data: ${snapshot.error}'));
        final page = snapshot.data;
        if (page == null || page.total == 0) return const Center(child: Text('No records yet.'));

        const gridHeight = 45.0 * (_visibleRows + 1) + 16;
        final totalPages = (page.total / _pageSize).ceil().clamp(1, 1 << 30);

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(height: gridHeight, child: _buildGrid(page.items)),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text('Rows per page:'),
                  const SizedBox(width: 8),
                  DropdownButton<int>(
                    value: _pageSize,
                    items: [for (final s in _pageSizeOptions) DropdownMenuItem(value: s, child: Text('$s'))],
                    onChanged: (s) {
                      if (s == null) return;
                      setState(() {
                        _pageSize = s;
                        _pageNumber = 1;
                      });
                      _fetchPage();
                    },
                  ),
                  const Spacer(),
                  Text('Page $_pageNumber of $totalPages · ${page.total} total'),
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    tooltip: 'Previous page',
                    onPressed: _pageNumber > 1
                        ? () {
                            setState(() => _pageNumber -= 1);
                            _fetchPage();
                          }
                        : null,
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    tooltip: 'Next page',
                    onPressed: _pageNumber < totalPages
                        ? () {
                            setState(() => _pageNumber += 1);
                            _fetchPage();
                          }
                        : null,
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildGrid(List<Map<String, dynamic>> items) {
    final recordsById = {for (final r in items) r['id'].toString(): r};
    final dateKey = _dateKey();

    final columns = <PlutoColumn>[
      PlutoColumn(title: 'id', field: 'id', type: PlutoColumnType.text(), hide: true, enableContextMenu: false),
      PlutoColumn(title: 'Number', field: 'number', type: PlutoColumnType.text(), width: 200),
      if (dateKey != null) PlutoColumn(title: 'Date', field: 'date', type: PlutoColumnType.text(), width: 140),
      for (var i = 0; i < widget.spec.summaryFields.length; i++)
        PlutoColumn(title: _humanize(widget.spec.summaryFields[i]), field: 'sum_$i', type: PlutoColumnType.text(), width: 150),
      PlutoColumn(title: 'Status', field: 'status', type: PlutoColumnType.text(), width: 150),
      PlutoColumn(
        title: 'Actions',
        field: 'actions',
        type: PlutoColumnType.text(),
        width: 90,
        enableSorting: false,
        enableColumnDrag: false,
        enableContextMenu: false,
        enableFilterMenuItem: false,
        renderer: (ctx) {
          final record = recordsById[ctx.row.cells['id']!.value as String];
          if (record == null) return const SizedBox.shrink();
          return Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              icon: const Icon(Icons.open_in_new, size: 18),
              tooltip: 'Open',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              onPressed: () => _openDetail(record),
            ),
          );
        },
      ),
    ];

    final rows = items.map((record) {
      return PlutoRow(cells: {
        'id': PlutoCell(value: record['id'].toString()),
        'number': PlutoCell(value: record[widget.spec.numberKey]?.toString() ?? ''),
        if (dateKey != null) 'date': PlutoCell(value: record[dateKey]?.toString().split('T').first ?? ''),
        for (var i = 0; i < widget.spec.summaryFields.length; i++)
          'sum_$i': PlutoCell(value: '₹${record[widget.spec.summaryFields[i]] ?? 0}'),
        'status': PlutoCell(value: record['status']?.toString() ?? ''),
        'actions': PlutoCell(value: ''),
      });
    }).toList();

    return PlutoGrid(
      columns: columns,
      rows: rows,
      mode: PlutoGridMode.readOnly,
      configuration: const PlutoGridConfiguration(
        columnSize: PlutoGridColumnSizeConfig(autoSizeMode: PlutoAutoSizeMode.scale),
        style: PlutoGridStyleConfig(
          gridBackgroundColor: Color(0xFFEEF2F6),
          rowColor: Color(0xFFEEF2F6),
          borderColor: Colors.white,
          gridBorderColor: Color(0xFFE2E8F0),
          enableColumnBorderVertical: false,
          enableCellBorderVertical: false,
          enableGridBorderShadow: false,
        ),
      ),
      onRowDoubleTap: (event) {
        final record = recordsById[event.row.cells['id']!.value as String];
        if (record != null) _openDetail(record);
      },
    );
  }
}
