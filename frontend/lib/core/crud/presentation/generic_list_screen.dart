import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pluto_grid/pluto_grid.dart';
import '../../api/api_exception.dart';
import '../../providers/core_providers.dart';
import '../application/generic_crud_providers.dart';
import '../entity_spec.dart';

const _pageSizeOptions = [12, 20, 50, 100];

/// Rows visible before the grid scrolls internally — kept constant across page-size changes so
/// picking a bigger page size fills the page with more data to scroll through, not a taller
/// screen.
const _visibleRows = 12;

class _Page {
  const _Page({required this.items, required this.total});

  final List<Map<String, dynamic>> items;
  final int total;
}

class GenericListScreen extends ConsumerStatefulWidget {
  const GenericListScreen({required this.spec, super.key});

  final EntitySpec spec;

  @override
  ConsumerState<GenericListScreen> createState() => _GenericListScreenState();
}

class _GenericListScreenState extends ConsumerState<GenericListScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  int _pageNumber = 1;
  late int _pageSize;
  Future<_Page>? _pageFuture;

  @override
  void initState() {
    super.initState();
    _pageSize = widget.spec.pageSize ?? _pageSizeOptions.first;
    if (widget.spec.pageSize != null) {
      _fetchPage();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _fetchPage() {
    setState(() {
      _pageFuture = ref
          .read(apiClientProvider)
          .get('/${widget.spec.resourcePath}', queryParameters: {'page': _pageNumber, 'limit': _pageSize})
          .then((data) {
            // Handle both shapes: a true server-paginated `{items, total}` envelope, OR a plain
            // full array (endpoint not yet server-paginated) — in which case slice it client-side
            // so the grid + page controls still work. Same frontend code path either way, so a
            // backend can be upgraded to real pagination later with no change here.
            if (data is Map<String, dynamic> && data.containsKey('items')) {
              return _Page(items: (data['items'] as List).cast<Map<String, dynamic>>(), total: data['total'] as int);
            }
            final all = (data as List).cast<Map<String, dynamic>>();
            final start = (_pageNumber - 1) * _pageSize;
            final pageItems = all.skip(start).take(_pageSize).toList();
            return _Page(items: pageItems, total: all.length);
          });
    });
  }

  void _refreshAfterMutation() {
    if (widget.spec.pageSize != null) {
      _fetchPage();
    } else {
      ref.invalidate(entityListProvider(widget.spec.resourcePath));
    }
  }

  List<Map<String, dynamic>> _filter(List<Map<String, dynamic>> records) {
    if (_query.isEmpty || widget.spec.searchableKeys.isEmpty) return records;
    final q = _query.toLowerCase();
    return records
        .where((r) => widget.spec.searchableKeys.any((k) => (r[k]?.toString() ?? '').toLowerCase().contains(q)))
        .toList();
  }

  String _displayName(Map<String, dynamic> record) =>
      (record['name'] ?? record['code'] ?? record['id']).toString();

  Future<void> _confirmDelete(Map<String, dynamic> record) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Delete "${_displayName(record)}"?'),
        content: const Text('This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    try {
      await ref.read(genericCrudApiProvider(widget.spec.resourcePath)).delete(record['id'] as String);
      _refreshAfterMutation();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  void _openDetail(Map<String, dynamic> record) {
    final routeBase = widget.spec.routeBase ?? '/master/${widget.spec.resourcePath}';
    context.push('$routeBase/${record['id']}', extra: record).then((_) => _refreshAfterMutation());
  }

  void _editRecord(Map<String, dynamic> record) {
    final routeBase = widget.spec.routeBase ?? '/master/${widget.spec.resourcePath}';
    context.push('$routeBase/${record['id']}/edit', extra: record).then((_) => _refreshAfterMutation());
  }

  @override
  Widget build(BuildContext context) {
    final routeBase = widget.spec.routeBase ?? '/master/${widget.spec.resourcePath}';

    return Scaffold(
      appBar: AppBar(title: Text(widget.spec.title)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('$routeBase/new').then((_) => _refreshAfterMutation()),
        icon: const Icon(Icons.add),
        label: const Text('New'),
      ),
      body: widget.spec.pageSize != null ? _buildPaginatedBody() : _buildUnpaginatedBody(routeBase),
    );
  }

  Widget _buildUnpaginatedBody(String routeBase) {
    final recordsAsync = ref.watch(entityListProvider(widget.spec.resourcePath));

    return Column(
      children: [
        if (widget.spec.searchableKeys.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'Search',
                border: OutlineInputBorder(),
                isDense: true,
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async => ref.invalidate(entityListProvider(widget.spec.resourcePath)),
            child: recordsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Could not load data: $e')),
              data: (records) {
                final filtered = _filter(records);
                if (filtered.isEmpty) {
                  return ListView(
                    children: const [Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No records yet.')))],
                  );
                }
                return widget.spec.useDataGrid ? _buildGrid(filtered) : _buildList(filtered, routeBase);
              },
            ),
          ),
        ),
      ],
    );
  }

  /// Server-paginated body for [EntitySpec.pageSize] modules — fetches one page at a time from
  /// the server rather than the full table, so the client-side search box above (which can only
  /// see whatever page is currently loaded) would be misleading; it's intentionally omitted
  /// here, unlike [_buildUnpaginatedBody].
  Widget _buildPaginatedBody() {
    return FutureBuilder<_Page>(
      future: _pageFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Could not load data: ${snapshot.error}'));
        }
        final page = snapshot.data;
        if (page == null || page.total == 0) {
          return const Center(child: Text('No records yet.'));
        }

        const rowHeight = 45.0;
        const gridHeight = rowHeight * (_visibleRows + 1) + 16; // +1 header row, +16 border/padding

        final totalPages = (page.total / _pageSize).ceil().clamp(1, 1 << 30);

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: gridHeight, child: _buildGrid(page.items)),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text('Rows per page:'),
                  const SizedBox(width: 8),
                  DropdownButton<int>(
                    value: _pageSize,
                    items: [
                      for (final size in _pageSizeOptions) DropdownMenuItem(value: size, child: Text('$size')),
                    ],
                    onChanged: (size) {
                      if (size == null) return;
                      setState(() {
                        _pageSize = size;
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

  Widget _buildList(List<Map<String, dynamic>> filtered, String routeBase) {
    return ListView.separated(
      padding: const EdgeInsets.only(bottom: 88),
      itemCount: filtered.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final record = filtered[index];
        final subtitle = widget.spec.listColumns.map((c) => '${c.label}: ${c.format(record)}').join(' · ');
        return ListTile(
          title: Text(_displayName(record)),
          subtitle: Text(subtitle),
          trailing: IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Delete',
            onPressed: () => _confirmDelete(record),
          ),
          onTap: () => context.push('$routeBase/${record['id']}', extra: record),
        );
      },
    );
  }

  /// ag-Grid-style table for [EntitySpec.useDataGrid] modules — sortable/resizable/
  /// draggable/filterable columns via `pluto_grid`. Every column is rendered as plain text
  /// (pre-formatted by [ColumnSpec.format]) since that's all a `ColumnSpec` carries; sorting is
  /// therefore lexicographic, not type-aware — acceptable for this first, scoped rollout.
  Widget _buildGrid(List<Map<String, dynamic>> filtered) {
    final recordsById = {for (final r in filtered) r['id'].toString(): r};

    final columns = <PlutoColumn>[
      PlutoColumn(title: 'id', field: 'id', type: PlutoColumnType.text(), hide: true, enableContextMenu: false),
      PlutoColumn(title: 'Name', field: 'name', type: PlutoColumnType.text(), width: 260),
      for (var i = 0; i < widget.spec.listColumns.length; i++)
        PlutoColumn(title: widget.spec.listColumns[i].label, field: 'col_$i', type: PlutoColumnType.text(), width: 170),
      PlutoColumn(
        title: 'Actions',
        field: 'actions',
        type: PlutoColumnType.text(),
        width: 150,
        minWidth: 150,
        enableSorting: false,
        enableColumnDrag: false,
        enableContextMenu: false,
        enableFilterMenuItem: false,
        renderer: (rendererContext) {
          final record = recordsById[rendererContext.row.cells['id']!.value as String];
          if (record == null) return const SizedBox.shrink();
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _actionIcon(icon: Icons.open_in_new, tooltip: 'Open', onPressed: () => _openDetail(record)),
              _actionIcon(icon: Icons.edit_outlined, tooltip: 'Edit', onPressed: () => _editRecord(record)),
              _actionIcon(icon: Icons.delete_outline, tooltip: 'Delete', onPressed: () => _confirmDelete(record)),
            ],
          );
        },
      ),
    ];

    final rows = filtered.map((record) {
      return PlutoRow(cells: {
        'id': PlutoCell(value: record['id'].toString()),
        'name': PlutoCell(value: _displayName(record)),
        for (var i = 0; i < widget.spec.listColumns.length; i++)
          'col_$i': PlutoCell(value: widget.spec.listColumns[i].format(record)),
        'actions': PlutoCell(value: ''),
      });
    }).toList();

    return PlutoGrid(
      columns: columns,
      rows: rows,
      mode: PlutoGridMode.readOnly,
      // Scale columns to fill the available width instead of leaving dead space on the right —
      // columns keep their relative proportions but stretch to the container. Users can still
      // drag-resize individual columns afterward.
      configuration: const PlutoGridConfiguration(
        columnSize: PlutoGridColumnSizeConfig(autoSizeMode: PlutoAutoSizeMode.scale),
        style: PlutoGridStyleConfig(
          // Lightly-tinted rows divided by crisp white horizontal separators; vertical column
          // gridlines removed for a clean list look rather than a spreadsheet grid.
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

  /// Compact icon button for the grid's Actions column — the default [IconButton] enforces a
  /// 48x48 minimum tap target, so three of them side by side (~150px available) overflow;
  /// shrinking padding/constraints here is what makes Open+Edit+Delete fit in one column.
  Widget _actionIcon({required IconData icon, required String tooltip, required VoidCallback onPressed}) {
    return IconButton(
      icon: Icon(icon, size: 18),
      tooltip: tooltip,
      onPressed: onPressed,
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
    );
  }
}
