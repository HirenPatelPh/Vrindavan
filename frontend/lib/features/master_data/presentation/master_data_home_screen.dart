import 'package:flutter/material.dart';
import '../../../core/widgets/nav_card.dart';
import '../master_data_registry.dart';

/// Per-module icon for the Master Data landing cards. Kept local to this screen (keyed by
/// resourcePath) rather than adding a field to EntitySpec, so it stays a one-file, cosmetic
/// change with no blast radius onto the 15 specs or the generic engine.
const _moduleIcons = <String, IconData>{
  'branches': Icons.business_outlined,
  'warehouses': Icons.warehouse_outlined,
  'racks': Icons.view_column_outlined,
  'locations': Icons.place_outlined,
  'categories': Icons.category_outlined,
  'sub-categories': Icons.account_tree_outlined,
  'brands': Icons.sell_outlined,
  'units': Icons.straighten_outlined,
  'gst-rates': Icons.percent_outlined,
  'hsn-codes': Icons.qr_code_2_outlined,
  'taxes': Icons.receipt_long_outlined,
  'suppliers': Icons.local_shipping_outlined,
  'customers': Icons.people_outline,
  'employees': Icons.badge_outlined,
  'transporters': Icons.directions_bus_outlined,
};

class MasterDataHomeScreen extends StatelessWidget {
  const MasterDataHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Master Data')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final group in masterDataGroups) ...[
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
                for (final spec in group.specs)
                  NavCard(
                    icon: _moduleIcons[spec.resourcePath] ?? Icons.folder_outlined,
                    title: spec.title,
                    route: '/master/${spec.resourcePath}',
                    countResourcePath: spec.resourcePath,
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
