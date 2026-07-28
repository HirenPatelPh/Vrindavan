import 'package:flutter/material.dart';
import '../../../core/widgets/nav_card.dart';
import '../inventory_registry.dart';
import 'blocked_stock_form_screen.dart';
import 'reserved_stock_form_screen.dart';

/// Per-link icon for the Inventory landing cards, keyed by resource path.
const _icons = <String, IconData>{
  'inventory/stock-transfers': Icons.swap_horiz,
  'inventory/stock-adjustments': Icons.tune,
  'inventory/physical-verifications': Icons.fact_check_outlined,
  'inventory/damaged-stock': Icons.report_gmailerrorred_outlined,
  'inventory/stock-returns': Icons.assignment_return_outlined,
  'inventory/blocked-stock': Icons.block,
  'inventory/reserved-stock': Icons.bookmark_border,
  'inventory/stock-balances': Icons.inventory_outlined,
  'inventory/stock-ledger': Icons.receipt_long_outlined,
};

class _Link {
  const _Link({required this.title, required this.path, this.count = false});
  final String title;
  final String path;
  final bool count;
}

class _Group {
  const _Group({required this.title, required this.icon, required this.links});
  final String title;
  final IconData icon;
  final List<_Link> links;
}

/// Landing screen for the Inventory nav destination — grouped [NavCard]s (icon + count badge),
/// matching the Master Data home. Reports (Stock Balances/Ledger) carry no count badge since
/// they aren't plain list resources.
class InventoryHomeScreen extends StatelessWidget {
  const InventoryHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final groups = [
      _Group(
        title: 'Documents',
        icon: Icons.description_outlined,
        links: [for (final spec in inventoryDocumentSpecs) _Link(title: spec.title, path: spec.resourcePath, count: true)],
      ),
      const _Group(
        title: 'Stock Control',
        icon: Icons.lock_outline,
        links: [
          _Link(title: 'Blocked Stock', path: blockedStockResourcePath, count: true),
          _Link(title: 'Reserved Stock', path: reservedStockResourcePath, count: true),
        ],
      ),
      const _Group(
        title: 'Reports',
        icon: Icons.bar_chart_outlined,
        links: [
          _Link(title: 'Stock Balances', path: 'inventory/stock-balances'),
          _Link(title: 'Stock Ledger', path: 'inventory/stock-ledger'),
        ],
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Inventory')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final group in groups) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 12, top: 8),
              child: Row(
                children: [
                  Icon(group.icon, size: 20),
                  const SizedBox(width: 8),
                  Text(group.title, style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
            ),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final link in group.links)
                  NavCard(
                    icon: _icons[link.path] ?? Icons.folder_outlined,
                    title: link.title,
                    route: '/${link.path}',
                    countResourcePath: link.count ? link.path : null,
                  ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }
}
