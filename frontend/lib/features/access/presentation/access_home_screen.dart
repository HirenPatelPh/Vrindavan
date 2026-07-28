import 'package:flutter/material.dart';
import '../../../core/widgets/nav_card.dart';

/// Landing for the admin-only "Users & Access" section — two [NavCard]s (Users, Roles &
/// Permissions) matching the other home screens.
class AccessHomeScreen extends StatelessWidget {
  const AccessHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Users & Access')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 12, top: 8),
            child: Row(
              children: [
                const Icon(Icons.admin_panel_settings_outlined, size: 20),
                const SizedBox(width: 8),
                Text('Administration', style: Theme.of(context).textTheme.titleMedium),
              ],
            ),
          ),
          const Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              NavCard(
                icon: Icons.people_outline,
                title: 'Users',
                route: '/access/users',
                countResourcePath: 'users',
              ),
              NavCard(
                icon: Icons.shield_outlined,
                title: 'Roles & Permissions',
                route: '/access/roles',
                countResourcePath: 'roles',
              ),
            ],
          ),
        ],
      ),
    );
  }
}
