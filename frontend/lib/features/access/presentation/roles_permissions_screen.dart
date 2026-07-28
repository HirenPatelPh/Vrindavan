import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/providers/core_providers.dart';

const _actions = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'];
const _actionLabels = {
  'view': 'View',
  'create': 'Create',
  'edit': 'Edit',
  'delete': 'Delete',
  'approve': 'Approve',
  'export': 'Export',
  'print': 'Print',
};

/// Per-role permission matrix: modules as rows, actions as columns, each cell a toggle that
/// writes one `module.action` permission for the selected role. Backed by GET /roles,
/// GET /permissions, GET/PUT /roles/:id/permissions.
class RolesPermissionsScreen extends ConsumerStatefulWidget {
  const RolesPermissionsScreen({super.key});

  @override
  ConsumerState<RolesPermissionsScreen> createState() => _RolesPermissionsScreenState();
}

class _RolesPermissionsScreenState extends ConsumerState<RolesPermissionsScreen> {
  List<Map<String, dynamic>> _roles = [];
  List<String> _modules = []; // distinct modules, in permission order
  final Map<String, Set<String>> _moduleActions = {}; // module -> set of actions that exist
  bool _loading = true;
  String? _error;

  String? _selectedRoleId;
  Set<String> _enabled = {}; // enabled permission codes for the selected role
  bool _dirty = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  bool get _isAdminRole =>
      _roles.firstWhere((r) => r['id'] == _selectedRoleId, orElse: () => const {})['name'] == 'Admin';

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final roles = (await api.get('/roles') as List).cast<Map<String, dynamic>>();
      final perms = (await api.get('/permissions') as List).cast<Map<String, dynamic>>();
      _modules = [];
      _moduleActions.clear();
      for (final p in perms) {
        final m = p['module'] as String;
        final a = p['action'] as String;
        if (!_moduleActions.containsKey(m)) {
          _modules.add(m);
          _moduleActions[m] = {};
        }
        _moduleActions[m]!.add(a);
      }
      setState(() {
        _roles = roles;
        _loading = false;
      });
      if (roles.isNotEmpty) {
        await _selectRole(roles.first['id'] as String);
      }
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _selectRole(String roleId) async {
    setState(() {
      _selectedRoleId = roleId;
      _enabled = {};
      _dirty = false;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/roles/$roleId/permissions');
      setState(() => _enabled = ((res as Map)['codes'] as List).cast<String>().toSet());
    } on ApiException catch (e) {
      await _showError(e.message);
    }
  }

  void _toggle(String module, String action, bool value) {
    final code = '$module.$action';
    setState(() {
      value ? _enabled.add(code) : _enabled.remove(code);
      _dirty = true;
    });
  }

  Future<void> _save() async {
    if (_selectedRoleId == null) return;
    setState(() => _saving = true);
    try {
      await ref.read(apiClientProvider).put('/roles/$_selectedRoleId/permissions', data: {'codes': _enabled.toList()});
      setState(() {
        _dirty = false;
        _saving = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Permissions saved. Users get the change on their next sign-in.')),
        );
      }
    } on ApiException catch (e) {
      setState(() => _saving = false);
      await _showError(e.message);
    }
  }

  Future<void> _showError(String message) => showDialog<void>(
        context: context,
        builder: (c) => AlertDialog(
          title: const Text('Action failed'),
          content: Text(message),
          actions: [TextButton(onPressed: () => Navigator.pop(c), child: const Text('OK'))],
        ),
      );

  String _humanize(String key) {
    final s = key.replaceAll('_', ' ');
    return s.isEmpty ? key : s[0].toUpperCase() + s.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Roles & Permissions'),
        actions: [
          TextButton.icon(
            onPressed: _createRole,
            icon: const Icon(Icons.add),
            label: const Text('New role'),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Could not load: $_error'))
              : Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          const Text('Role'),
                          const SizedBox(width: 12),
                          DropdownButton<String>(
                            value: _selectedRoleId,
                            items: [
                              for (final r in _roles)
                                DropdownMenuItem(value: r['id'] as String, child: Text(r['name'] as String)),
                            ],
                            onChanged: (v) {
                              if (v != null) _selectRole(v);
                            },
                          ),
                          const Spacer(),
                          if (_isAdminRole)
                            const Text('Admin always has full access', style: TextStyle(color: Colors.grey))
                          else
                            FilledButton.icon(
                              onPressed: (_dirty && !_saving) ? _save : null,
                              icon: _saving
                                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                  : const Icon(Icons.save_outlined),
                              label: const Text('Save changes'),
                            ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    Expanded(child: _matrix()),
                  ],
                ),
    );
  }

  Widget _matrix() {
    final locked = _isAdminRole;
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowColor: WidgetStateProperty.all(const Color(0xFFF1F5F9)),
          columns: [
            const DataColumn(label: Text('Module')),
            for (final a in _actions) DataColumn(label: Text(_actionLabels[a]!)),
          ],
          rows: [
            for (final module in _modules)
              DataRow(cells: [
                DataCell(Text(_humanize(module), style: const TextStyle(fontWeight: FontWeight.w500))),
                for (final a in _actions)
                  DataCell(
                    _moduleActions[module]!.contains(a)
                        ? Transform.scale(
                            scale: 0.75,
                            child: Switch(
                              value: locked ? true : _enabled.contains('$module.$a'),
                              onChanged: locked ? null : (v) => _toggle(module, a, v),
                            ),
                          )
                        : const SizedBox.shrink(),
                  ),
              ]),
          ],
        ),
      ),
    );
  }

  Future<void> _createRole() async {
    final name = TextEditingController();
    final description = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('New role'),
        content: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Role name')),
              const SizedBox(height: 8),
              TextField(controller: description, decoration: const InputDecoration(labelText: 'Description (optional)')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Create')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      final created = await ref.read(apiClientProvider).post('/roles', data: {
        'name': name.text.trim(),
        if (description.text.trim().isNotEmpty) 'description': description.text.trim(),
      });
      await _load();
      if (created is Map && created['id'] != null) await _selectRole(created['id'] as String);
    } on ApiException catch (e) {
      await _showError(e.message);
    }
  }
}
