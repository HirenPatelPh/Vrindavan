import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';

/// Admin-only audit trail: who changed which record, when, and the before/after values.
/// Gated server-side by `audit_logs.view`; reached at /audit (admin-only nav entry).
class AuditLogScreen extends ConsumerStatefulWidget {
  const AuditLogScreen({super.key});

  @override
  ConsumerState<AuditLogScreen> createState() => _AuditLogScreenState();
}

class _AuditLogScreenState extends ConsumerState<AuditLogScreen> {
  List<String> _tables = [];
  String? _table;
  String? _action;
  DateTime? _from;
  DateTime? _to;
  int _page = 1;
  int _limit = 20;

  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];
  int _total = 0;

  @override
  void initState() {
    super.initState();
    _loadTables();
    _fetch();
  }

  Future<void> _loadTables() async {
    try {
      final data = await ref.read(apiClientProvider).get('/audit-logs/tables');
      if (mounted) setState(() => _tables = (data as List).cast<String>());
    } catch (_) {/* filter dropdown is best-effort */}
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final params = <String, dynamic>{'page': _page, 'limit': _limit};
      if (_table != null) params['tableName'] = _table;
      if (_action != null) params['action'] = _action;
      if (_from != null) params['fromDate'] = _fmt(_from!);
      if (_to != null) params['toDate'] = _fmt(_to!);
      final data = await ref.read(apiClientProvider).get('/audit-logs', queryParameters: params);
      final map = data as Map<String, dynamic>;
      if (mounted) {
        setState(() {
          _items = (map['items'] as List).cast<Map<String, dynamic>>();
          _total = (map['total'] as num).toInt();
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _fmt(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  void _applyAndReload() {
    _page = 1;
    _fetch();
  }

  @override
  Widget build(BuildContext context) {
    final lastPage = (_total / _limit).ceil().clamp(1, 1 << 30);
    return Scaffold(
      appBar: AppBar(title: const Text('Audit Log')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _filters(),
            const SizedBox(height: 12),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                      ? Center(child: Text('Could not load audit log: $_error'))
                      : _items.isEmpty
                          ? const Center(child: Text('No matching changes.'))
                          : ListView.separated(
                              itemCount: _items.length,
                              separatorBuilder: (_, _) => const Divider(height: 1),
                              itemBuilder: (_, i) => _AuditTile(entry: _items[i]),
                            ),
            ),
            const SizedBox(height: 8),
            _pager(lastPage),
          ],
        ),
      ),
    );
  }

  Widget _filters() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        SizedBox(
          width: 220,
          child: DropdownButtonFormField<String?>(
            initialValue: _table,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Table', isDense: true, border: OutlineInputBorder()),
            items: [
              const DropdownMenuItem(value: null, child: Text('All tables')),
              for (final t in _tables) DropdownMenuItem(value: t, child: Text(_humanize(t))),
            ],
            onChanged: (v) {
              _table = v;
              _applyAndReload();
            },
          ),
        ),
        SizedBox(
          width: 160,
          child: DropdownButtonFormField<String?>(
            initialValue: _action,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Action', isDense: true, border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem(value: null, child: Text('All actions')),
              DropdownMenuItem(value: 'insert', child: Text('Created')),
              DropdownMenuItem(value: 'update', child: Text('Updated')),
              DropdownMenuItem(value: 'delete', child: Text('Deleted')),
            ],
            onChanged: (v) {
              _action = v;
              _applyAndReload();
            },
          ),
        ),
        OutlinedButton.icon(
          icon: const Icon(Icons.date_range, size: 18),
          label: Text(_from == null ? 'From' : _fmt(_from!)),
          onPressed: () async {
            final d = await _pickDate(_from);
            if (d != null) {
              _from = d;
              _applyAndReload();
            }
          },
        ),
        OutlinedButton.icon(
          icon: const Icon(Icons.date_range, size: 18),
          label: Text(_to == null ? 'To' : _fmt(_to!)),
          onPressed: () async {
            final d = await _pickDate(_to);
            if (d != null) {
              _to = d;
              _applyAndReload();
            }
          },
        ),
        if (_table != null || _action != null || _from != null || _to != null)
          TextButton(
            onPressed: () {
              setState(() {
                _table = null;
                _action = null;
                _from = null;
                _to = null;
              });
              _applyAndReload();
            },
            child: const Text('Clear'),
          ),
        Text('$_total entries', style: const TextStyle(color: Color(0xFF64748B))),
      ],
    );
  }

  Future<DateTime?> _pickDate(DateTime? initial) => showDatePicker(
        context: context,
        initialDate: initial ?? DateTime.now(),
        firstDate: DateTime(2020),
        lastDate: DateTime.now().add(const Duration(days: 1)),
      );

  Widget _pager(int lastPage) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        DropdownButton<int>(
          value: _limit,
          items: const [20, 50, 100].map((n) => DropdownMenuItem(value: n, child: Text('$n / page'))).toList(),
          onChanged: (v) {
            if (v != null) {
              setState(() => _limit = v);
              _applyAndReload();
            }
          },
        ),
        const SizedBox(width: 16),
        IconButton(
          icon: const Icon(Icons.chevron_left),
          onPressed: _page > 1 ? () { setState(() => _page--); _fetch(); } : null,
        ),
        Text('Page $_page of $lastPage'),
        IconButton(
          icon: const Icon(Icons.chevron_right),
          onPressed: _page < lastPage ? () { setState(() => _page++); _fetch(); } : null,
        ),
      ],
    );
  }
}

String _humanize(String table) =>
    table.split('_').map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}').join(' ');

/// One audit row, expandable to the field-level before/after diff.
class _AuditTile extends StatelessWidget {
  const _AuditTile({required this.entry});
  final Map<String, dynamic> entry;

  @override
  Widget build(BuildContext context) {
    final action = entry['action'] as String? ?? '';
    final table = entry['tableName'] as String? ?? '';
    final who = (entry['changedByName'] as String?) ?? 'System';
    final at = (entry['changedAt'] as String?) ?? '';
    final (icon, color, verb) = switch (action) {
      'insert' => (Icons.add_circle_outline, const Color(0xFF1D9E75), 'created'),
      'update' => (Icons.edit_outlined, const Color(0xFFB8860B), 'updated'),
      'delete' => (Icons.delete_outline, const Color(0xFFA32D2D), 'deleted'),
      _ => (Icons.help_outline, const Color(0xFF64748B), action),
    };
    final changes = _diff(entry['oldData'], entry['newData'], action);
    return ExpansionTile(
      leading: Icon(icon, color: color),
      title: Text('$who $verb ${_humanize(table)}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      subtitle: Text('${_when(at)} · ${changes.length} field${changes.length == 1 ? '' : 's'}',
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
      childrenPadding: const EdgeInsets.fromLTRB(56, 0, 16, 12),
      children: changes.isEmpty
          ? [const Align(alignment: Alignment.centerLeft, child: Text('No field-level detail.'))]
          : changes.map((c) => _diffRow(c.$1, c.$2, c.$3)).toList(),
    );
  }

  Widget _diffRow(String field, String? oldV, String? newV) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 150, child: Text(_humanize(field), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12))),
          Expanded(
            child: Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                if (oldV != null)
                  Text(oldV, style: const TextStyle(fontSize: 12, color: Color(0xFFA32D2D), decoration: TextDecoration.lineThrough)),
                if (oldV != null && newV != null)
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 6), child: Icon(Icons.arrow_forward, size: 12, color: Color(0xFF94A3B8))),
                if (newV != null)
                  Text(newV, style: const TextStyle(fontSize: 12, color: Color(0xFF1D9E75), fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _when(String iso) {
    final dt = DateTime.tryParse(iso)?.toLocal();
    if (dt == null) return iso;
    String two(int n) => n.toString().padLeft(2, '0');
    return '${dt.year}-${two(dt.month)}-${two(dt.day)} ${two(dt.hour)}:${two(dt.minute)}';
  }

  /// Field-level diff from the old/new JSON snapshots. Skips noisy always-changing keys.
  List<(String, String?, String?)> _diff(dynamic oldData, dynamic newData, String action) {
    const skip = {'updated_at', 'created_at'};
    final oldMap = (oldData is Map) ? oldData.cast<String, dynamic>() : <String, dynamic>{};
    final newMap = (newData is Map) ? newData.cast<String, dynamic>() : <String, dynamic>{};
    final keys = {...oldMap.keys, ...newMap.keys}.where((k) => !skip.contains(k)).toList()..sort();
    final out = <(String, String?, String?)>[];
    for (final k in keys) {
      final o = oldMap[k];
      final n = newMap[k];
      if (action == 'update' && '$o' == '$n') continue; // only show what actually changed
      out.add((k, action == 'insert' ? null : _str(o), action == 'delete' ? null : _str(n)));
    }
    return out;
  }

  String? _str(dynamic v) {
    if (v == null) return '—';
    final s = v.toString();
    return s.length > 60 ? '${s.substring(0, 60)}…' : s;
  }
}
