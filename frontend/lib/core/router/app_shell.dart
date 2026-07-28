import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/application/auth_provider.dart';
import '../../features/master_data/master_data_registry.dart';
import '../theme/app_theme.dart';

/// Persistent chrome around every authenticated screen: a brand app bar (title, signed-in
/// user, logout) plus responsive navigation — a permanent [NavigationRail] at width >= 640
/// (extended once there's room, >= 960), collapsing to a [Drawer] below that. Individual pages
/// (DashboardScreen, GenericListScreen, ...) render their own body content — most also own a
/// nested Scaffold for a page-local AppBar title/back-button/FAB, which stacks visually beneath
/// this outer bar rather than replacing it.
class AppShell extends ConsumerWidget {
  const AppShell({
    required this.child,
    required this.currentLocation,
    super.key,
  });

  final Widget child;
  final String currentLocation;

  static const _railBreakpoint = 640.0;
  static const _extendedBreakpoint = 960.0;

  // Base destinations shown to everyone; the admin-only "Users & Access" entry is appended when
  // the signed-in user has the Admin role (see build()).
  static const _baseRoutes = ['/dashboard', '/master', '/products', '/inventory', '/purchase', '/sales', '/reports'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authProvider).value;
    final width = MediaQuery.sizeOf(context).width;
    final isWide = width >= _railBreakpoint;
    final isAdmin = session?.user.roles.contains('Admin') ?? false;
    final routes = [..._baseRoutes, if (isAdmin) '/access'];
    var selectedIndex = routes.indexWhere((r) => currentLocation.startsWith(r));
    if (selectedIndex < 0) selectedIndex = 0;

    final appBar = AppBar(
      // The single dark "shell" bar — explicitly dark navy since the global app-bar theme is now
      // light (used by the per-page title bars). Keeps the top strip dark while pages stay light.
      backgroundColor: AppTheme.sidebarBg,
      foregroundColor: Colors.white,
      titleTextStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
      title: const Text('Vrindavan'),
      // Hairline in a slightly lighter navy separating the top bar from the sidebar/content
      // below (both are the same navy, so without this they read as one undivided block).
      shape: const Border(bottom: BorderSide(color: Color(0xFF3A3F63), width: 1)),
      actions: [
        if (session != null)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: PopupMenuButton<String>(
              tooltip: 'Account',
              position: PopupMenuPosition.under,
              onSelected: (value) {
                if (value == 'logout') ref.read(authProvider.notifier).logout();
              },
              itemBuilder: (context) => [
                // Non-selectable header showing who's signed in.
                PopupMenuItem<String>(
                  enabled: false,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        session.user.name,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 2),
                      Text(session.user.email, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                const PopupMenuItem<String>(
                  value: 'logout',
                  child: ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.logout, color: Color(0xFFDC2626)),
                    title: Text('Sign out', style: TextStyle(color: Color(0xFFDC2626))),
                  ),
                ),
              ],
              // The clickable chip in the top-right: avatar + email + caret.
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: AppTheme.accent,
                    child: Text(
                      _userInitials(session.user.name, session.user.email),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F3D34)),
                    ),
                  ),
                  if (width >= 500) ...[
                    const SizedBox(width: 8),
                    Text(
                      session.user.email,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white),
                    ),
                  ],
                  const Icon(Icons.arrow_drop_down, color: AppTheme.sidebarUnselected),
                ],
              ),
            ),
          ),
      ],
    );

    if (isWide) {
      return Scaffold(
        appBar: appBar,
        body: Row(
          children: [
            NavigationRail(
              extended: width >= _extendedBreakpoint,
              selectedIndex: selectedIndex,
              onDestinationSelected: (i) => context.go(routes[i]),
              destinations: [
                const NavigationRailDestination(icon: Icon(Icons.dashboard_outlined), label: Text('Dashboard')),
                const NavigationRailDestination(icon: Icon(Icons.storage_outlined), label: Text('Master Data')),
                const NavigationRailDestination(icon: Icon(Icons.inventory_2_outlined), label: Text('Products')),
                const NavigationRailDestination(icon: Icon(Icons.warehouse_outlined), label: Text('Inventory')),
                const NavigationRailDestination(icon: Icon(Icons.shopping_cart_outlined), label: Text('Purchase')),
                const NavigationRailDestination(icon: Icon(Icons.point_of_sale_outlined), label: Text('Sales')),
                const NavigationRailDestination(icon: Icon(Icons.assessment_outlined), label: Text('Reports')),
                if (isAdmin)
                  const NavigationRailDestination(
                    icon: Icon(Icons.admin_panel_settings_outlined),
                    label: Text('Users & Access'),
                  ),
              ],
            ),
            const VerticalDivider(width: 1),
            Expanded(child: child),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: appBar,
      drawer: _AppDrawer(currentLocation: currentLocation, isAdmin: isAdmin),
      body: child,
    );
  }
}

class _AppDrawer extends StatelessWidget {
  const _AppDrawer({required this.currentLocation, required this.isAdmin});

  final String currentLocation;
  final bool isAdmin;

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppTheme.sidebarBg,
      child: Theme(
        data: AppTheme.sidebar(context),
        child: SafeArea(
          child: ListView(
            children: [
              ListTile(
                leading: const Icon(Icons.dashboard_outlined),
                title: const Text('Dashboard'),
                selected: currentLocation.startsWith('/dashboard'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/dashboard');
                },
              ),
              ExpansionTile(
                leading: const Icon(Icons.storage_outlined),
                title: const Text('Master Data'),
                initiallyExpanded: currentLocation.startsWith('/master'),
                children: [
                  for (final group in masterDataGroups) ...[
                    Padding(
                      padding: const EdgeInsets.only(left: 16, top: 8),
                      child: Text(
                        group.title,
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                    ),
                    for (final spec in group.specs)
                      ListTile(
                        contentPadding: const EdgeInsets.only(
                          left: 32,
                          right: 16,
                        ),
                        title: Text(spec.title),
                        onTap: () {
                          Navigator.pop(context);
                          context.go('/master/${spec.resourcePath}');
                        },
                      ),
                  ],
                ],
              ),
              ListTile(
                leading: const Icon(Icons.inventory_2_outlined),
                title: const Text('Products'),
                selected: currentLocation.startsWith('/products'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/products');
                },
              ),
              ListTile(
                leading: const Icon(Icons.warehouse_outlined),
                title: const Text('Inventory'),
                selected: currentLocation.startsWith('/inventory'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/inventory');
                },
              ),
              ListTile(
                leading: const Icon(Icons.shopping_cart_outlined),
                title: const Text('Purchase'),
                selected: currentLocation.startsWith('/purchase'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/purchase');
                },
              ),
              ListTile(
                leading: const Icon(Icons.point_of_sale_outlined),
                title: const Text('Sales'),
                selected: currentLocation.startsWith('/sales'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/sales');
                },
              ),
              ListTile(
                leading: const Icon(Icons.assessment_outlined),
                title: const Text('Reports'),
                selected: currentLocation.startsWith('/reports'),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/reports');
                },
              ),
              if (isAdmin)
                ListTile(
                  leading: const Icon(Icons.admin_panel_settings_outlined),
                  title: const Text('Users & Access'),
                  selected: currentLocation.startsWith('/access'),
                  onTap: () {
                    Navigator.pop(context);
                    context.go('/access');
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// 1–2 uppercase initials for the account-menu avatar: from the user's name when present
/// (first + last word), otherwise the first letter of their email.
String _userInitials(String name, String email) {
  final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) {
    return email.isNotEmpty ? email[0].toUpperCase() : '?';
  }
  if (parts.length == 1) return parts.first[0].toUpperCase();
  return (parts.first[0] + parts.last[0]).toUpperCase();
}
