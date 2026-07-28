import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../crud/application/generic_crud_providers.dart';

// Teal accent family (matches the sidebar accent), used for the card's left bar, icon, and
// count badge — shared by every home/landing screen.
const _barColor = Color(0xFF1D9E75);
const _iconColor = Color(0xFF0F6E56);
const _badgeBg = Color(0xFFE1F5EE);

/// Shared landing-screen card: a teal left accent bar, an icon, a label, and — when
/// [countResourcePath] is set — a live record-count badge fetched from that resource's list
/// endpoint. Used by the Master Data / Inventory / Purchase / Sales / Reports home screens so
/// they all share one look. Omit [countResourcePath] for cards whose target isn't a plain list
/// resource (e.g. date-filtered reports), which then render as icon + label only.
class NavCard extends ConsumerWidget {
  const NavCard({
    required this.icon,
    required this.title,
    required this.route,
    this.countResourcePath,
    super.key,
  });

  final IconData icon;
  final String title;
  final String route;
  final String? countResourcePath;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget? badge;
    if (countResourcePath != null) {
      final countAsync = ref.watch(entityListProvider(countResourcePath!));
      badge = countAsync.when(
        loading: () => const SizedBox(
          width: 14,
          height: 14,
          child: CircularProgressIndicator(strokeWidth: 2, color: _iconColor),
        ),
        error: (_, _) => const SizedBox.shrink(),
        data: (records) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(color: _badgeBg, borderRadius: BorderRadius.circular(20)),
          child: Text(
            '${records.length}',
            style: const TextStyle(color: _iconColor, fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ),
      );
    }

    return SizedBox(
      width: 240,
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.push(route),
          child: IntrinsicHeight(
            child: Row(
              children: [
                Container(width: 4, color: _barColor),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                    child: Row(
                      children: [
                        Icon(icon, size: 20, color: _iconColor),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(title, style: Theme.of(context).textTheme.titleSmall, overflow: TextOverflow.ellipsis),
                        ),
                        if (badge != null) ...[const SizedBox(width: 8), badge],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
