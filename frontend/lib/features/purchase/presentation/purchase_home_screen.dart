import 'package:flutter/material.dart';
import '../../../core/widgets/nav_card.dart';
import '../purchase_registry.dart';
import 'supplier_payment_form_screen.dart';

const _icons = <String, IconData>{
  'purchase/purchase-orders': Icons.shopping_cart_outlined,
  'purchase/goods-received-notes': Icons.inventory_2_outlined,
  'purchase/purchase-invoices': Icons.receipt_long_outlined,
  'purchase/purchase-returns': Icons.assignment_return_outlined,
  'purchase/supplier-payments': Icons.payments_outlined,
  'purchase/outstanding-payables': Icons.account_balance_wallet_outlined,
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

/// Landing screen for the Purchase nav destination — grouped [NavCard]s (icon + count badge),
/// matching the Master Data home. Outstanding Payables carries no count badge (date/filter
/// report, not a plain list resource).
class PurchaseHomeScreen extends StatelessWidget {
  const PurchaseHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final groups = [
      _Group(
        title: 'Documents',
        icon: Icons.description_outlined,
        links: [for (final spec in purchaseDocumentSpecs) _Link(title: spec.title, path: spec.resourcePath, count: true)],
      ),
      const _Group(
        title: 'Payments',
        icon: Icons.payments_outlined,
        links: [_Link(title: 'Supplier Payments', path: supplierPaymentResourcePath, count: true)],
      ),
      const _Group(
        title: 'Reports',
        icon: Icons.bar_chart_outlined,
        links: [_Link(title: 'Outstanding Payables', path: 'purchase/outstanding-payables')],
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Purchase')),
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
