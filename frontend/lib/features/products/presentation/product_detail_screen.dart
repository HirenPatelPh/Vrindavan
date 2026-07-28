import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';
import '../../../core/crud/presentation/fk_picker_field.dart';
import '../../../core/providers/core_providers.dart';
import 'product_barcodes_tab.dart';
import 'product_batches_tab.dart';
import 'product_images_tab.dart';
import 'product_price_history_tab.dart';
import 'product_units_tab.dart';

/// A product's full detail view: a header of key resolved fields (category/brand names looked
/// up the same way [FkPickerField] does — watch the master list, find by id) plus a tab per
/// nested collection (Images/Units/Batches/Barcodes/Price History). Reached at `/products/:id`
/// (see `productSpec.routeBase`); "Edit" pushes `/products/:id/edit`, which reuses
/// `GenericFormScreen` exactly like every master-data edit flow.
class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({required this.productId, this.initialData, super.key});

  final String productId;
  final Map<String, dynamic>? initialData;

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  Map<String, dynamic>? _product;
  bool _loading = true;
  String? _error;
  bool _openingStockPosted = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialData != null) {
      _product = widget.initialData;
      _loading = false;
      _checkOpeningStockPosted();
    } else {
      _load();
    }
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ref.read(genericCrudApiProvider('products')).getOne(widget.productId);
      if (!mounted) return;
      setState(() {
        _product = data;
        _loading = false;
      });
      _checkOpeningStockPosted();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  /// The backend has no dedicated "has opening stock been posted" endpoint — it can only be
  /// posted once ever per product (409 on a second attempt), so this scans the ledger for an
  /// existing `opening_stock` row to decide whether to show the action at all.
  Future<void> _checkOpeningStockPosted() async {
    try {
      final rows = await ref
          .read(apiClientProvider)
          .get('/inventory/stock-ledger', queryParameters: {'productId': widget.productId, 'limit': 500});
      final posted = (rows as List).any((r) => r['movementType'] == 'opening_stock');
      if (!mounted) return;
      setState(() => _openingStockPosted = posted);
    } on ApiException {
      // Non-critical — leave the button visible; the backend's own 409 covers the edge case.
    }
  }

  Future<void> _postOpeningStock() async {
    const warehouseField = FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses');
    String? warehouseId;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setState) => AlertDialog(
          title: const Text('Post Opening Stock'),
          content: SizedBox(
            width: 360,
            child: FkPickerField(field: warehouseField, value: warehouseId, onChanged: (v) => setState(() => warehouseId = v)),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
            FilledButton(
              onPressed: warehouseId == null ? null : () => Navigator.pop(dialogContext, true),
              child: const Text('Post'),
            ),
          ],
        ),
      ),
    );
    if (confirmed != true || warehouseId == null || !mounted) return;
    try {
      await ref
          .read(apiClientProvider)
          .post('/inventory/products/${widget.productId}/post-opening-stock', data: {'warehouseId': warehouseId});
      _checkOpeningStockPosted();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  String? _resolveFkName(String resourcePath, String? id) {
    if (id == null) return null;
    final recordsAsync = ref.watch(entityListProvider(resourcePath));
    return recordsAsync.maybeWhen(
      data: (records) {
        for (final r in records) {
          if (r['id'] == id) return r['name']?.toString();
        }
        return null;
      },
      orElse: () => null,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null || _product == null) {
      return Scaffold(body: Center(child: Text('Could not load product: ${_error ?? 'not found'}')));
    }
    final product = _product!;
    final categoryName = _resolveFkName('categories', product['categoryId'] as String?);
    final brandName = _resolveFkName('brands', product['brandId'] as String?);

    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: Text(product['name']?.toString() ?? 'Product'),
          actions: [
            if (((product['openingStock'] as num?) ?? 0) > 0 && !_openingStockPosted)
              TextButton(
                onPressed: _postOpeningStock,
                child: const Text('Post Opening Stock'),
              ),
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit',
              onPressed: () async {
                await context.push('/products/${widget.productId}/edit', extra: product);
                _load();
              },
            ),
          ],
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Images'),
              Tab(text: 'Units'),
              Tab(text: 'Batches'),
              Tab(text: 'Barcodes'),
              Tab(text: 'Price History'),
            ],
          ),
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Wrap(
                spacing: 24,
                runSpacing: 8,
                children: [
                  _InfoItem(label: 'SKU', value: orDash(product['sku'])),
                  _InfoItem(label: 'Category', value: orDash(categoryName)),
                  _InfoItem(label: 'Brand', value: orDash(brandName)),
                  _InfoItem(label: 'Selling price', value: '₹${product['sellingPrice']}'),
                  _InfoItem(label: 'Reorder level', value: '${product['reorderLevel']}'),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: TabBarView(
                children: [
                  ProductImagesTab(productId: widget.productId),
                  ProductUnitsTab(productId: widget.productId),
                  ProductBatchesTab(productId: widget.productId),
                  ProductBarcodesTab(productId: widget.productId),
                  ProductPriceHistoryTab(productId: widget.productId),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  const _InfoItem({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        Text(value, style: Theme.of(context).textTheme.titleSmall),
      ],
    );
  }
}
