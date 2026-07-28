import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/providers/core_providers.dart';

class UsersScreen extends ConsumerStatefulWidget {
  const UsersScreen({super.key});

  @override
  ConsumerState<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends ConsumerState<UsersScreen> {
  List<Map<String, dynamic>> _users = [];
  List<Map<String, dynamic>> _roles = []; // {id, name, isSystemRole, ...}
  bool _loading = true;
  String? _error;

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
      final api = ref.read(apiClientProvider);
      final users = await api.get('/users');
      final roles = await api.get('/roles');
      setState(() {
        _users = (users as List).cast<Map<String, dynamic>>();
        _roles = (roles as List).cast<Map<String, dynamic>>();
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
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

  Future<void> _toggleActive(Map<String, dynamic> user) async {
    try {
      await ref.read(apiClientProvider).patch('/users/${user['id']}', data: {'isActive': !(user['isActive'] as bool)});
      await _load();
    } on ApiException catch (e) {
      await _showError(e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Users')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _roles.isEmpty ? null : _openCreateDialog,
        icon: const Icon(Icons.person_add_alt),
        label: const Text('New user'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Could not load: $_error'))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _users.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 8),
                    itemBuilder: (context, i) => _userTile(_users[i]),
                  ),
                ),
    );
  }

  Widget _userTile(Map<String, dynamic> user) {
    final active = user['isActive'] as bool;
    final roles = (user['roles'] as List).cast<String>();
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: const Color(0xFFE1F5EE),
              child: Text(
                (user['name'] as String).isNotEmpty ? (user['name'] as String)[0].toUpperCase() : '?',
                style: const TextStyle(color: Color(0xFF0F6E56), fontWeight: FontWeight.w600),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(user['name'] as String, style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(width: 8),
                      if (!active)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: const Color(0xFFFCEBEB), borderRadius: BorderRadius.circular(20)),
                          child: const Text('Inactive', style: TextStyle(color: Color(0xFF991B1B), fontSize: 12)),
                        ),
                    ],
                  ),
                  Text(user['email'] as String, style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      for (final r in roles)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: const Color(0xFFEEF2F6), borderRadius: BorderRadius.circular(20)),
                          child: Text(r, style: const TextStyle(fontSize: 12)),
                        ),
                      if (roles.isEmpty)
                        const Text('No roles', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),
            PopupMenuButton<String>(
              onSelected: (v) {
                switch (v) {
                  case 'roles':
                    _openRolesDialog(user);
                  case 'password':
                    _openResetPasswordDialog(user);
                  case 'active':
                    _toggleActive(user);
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'roles', child: Text('Assign roles')),
                const PopupMenuItem(value: 'password', child: Text('Reset password')),
                PopupMenuItem(value: 'active', child: Text(active ? 'Deactivate' : 'Activate')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openCreateDialog() async {
    final name = TextEditingController();
    final email = TextEditingController();
    final phone = TextEditingController();
    final password = TextEditingController();
    final selected = <String>{};

    final created = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setLocal) => AlertDialog(
          title: const Text('New user'),
          content: SizedBox(
            width: 420,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(controller: name, decoration: const InputDecoration(labelText: 'Name')),
                  const SizedBox(height: 8),
                  TextField(controller: email, decoration: const InputDecoration(labelText: 'Email')),
                  const SizedBox(height: 8),
                  TextField(controller: phone, decoration: const InputDecoration(labelText: 'Phone (optional)')),
                  const SizedBox(height: 8),
                  TextField(
                    controller: password,
                    decoration: const InputDecoration(labelText: 'Temporary password (min 8 chars)'),
                  ),
                  const SizedBox(height: 12),
                  const Align(alignment: Alignment.centerLeft, child: Text('Roles')),
                  for (final role in _roles)
                    CheckboxListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text(role['name'] as String),
                      value: selected.contains(role['id']),
                      onChanged: (v) => setLocal(() => v == true ? selected.add(role['id'] as String) : selected.remove(role['id'])),
                    ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Create')),
          ],
        ),
      ),
    );

    if (created != true) return;
    try {
      await ref.read(apiClientProvider).post('/users', data: {
        'name': name.text.trim(),
        'email': email.text.trim(),
        if (phone.text.trim().isNotEmpty) 'phone': phone.text.trim(),
        'password': password.text,
        'roleIds': selected.toList(),
      });
      await _load();
    } on ApiException catch (e) {
      await _showError(e.message);
    }
  }

  Future<void> _openRolesDialog(Map<String, dynamic> user) async {
    final currentNames = (user['roles'] as List).cast<String>().toSet();
    final selected = _roles.where((r) => currentNames.contains(r['name'])).map((r) => r['id'] as String).toSet();

    final saved = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setLocal) => AlertDialog(
          title: Text('Roles — ${user['name']}'),
          content: SizedBox(
            width: 380,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (final role in _roles)
                    CheckboxListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text(role['name'] as String),
                      value: selected.contains(role['id']),
                      onChanged: (v) => setLocal(() => v == true ? selected.add(role['id'] as String) : selected.remove(role['id'])),
                    ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Save')),
          ],
        ),
      ),
    );

    if (saved != true) return;
    try {
      await ref.read(apiClientProvider).post('/users/${user['id']}/roles', data: {'roleIds': selected.toList()});
      await _load();
    } on ApiException catch (e) {
      await _showError(e.message);
    }
  }

  Future<void> _openResetPasswordDialog(Map<String, dynamic> user) async {
    final password = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Reset password — ${user['name']}'),
        content: SizedBox(
          width: 360,
          child: TextField(
            controller: password,
            decoration: const InputDecoration(labelText: 'New password (min 8 chars)'),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Reset')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await ref.read(apiClientProvider).post('/users/${user['id']}/reset-password', data: {'password': password.text});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset. User must change it on next login.')));
      }
    } on ApiException catch (e) {
      await _showError(e.message);
    }
  }
}
