import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/presentation/fk_picker_field.dart';
import '../../../core/providers/core_providers.dart';

const _productFilterField = FieldSpec(
  key: 'productId',
  label: 'Product (all)',
  type: FieldType.dropdownFk,
  fkResource: 'products',
  fkCodeKey: 'sku',
);
const _warehouseFilterField = FieldSpec(key: 'warehouseId', label: 'Warehouse (all)', type: FieldType.dropdownFk, fkResource: 'warehouses');

/// Read-only report backed by `v_current_stock` — the response already carries denormalized
/// `productName`/`warehouseName`/`rackName`/`locationName`/`batchNumber` strings, so unlike
/// every other list in this app, no FK resolution is needed here.
class StockBalancesScreen extends ConsumerStatefulWidget {
  const StockBalancesScreen({super.key});

  @override
  ConsumerState<StockBalancesScreen> createState() => _StockBalancesScreenState();
}

class _StockBalancesScreenState extends ConsumerState<StockBalancesScreen> {
  String? _productId;
  String? _warehouseId;
  Future<List<Map<String, dynamic>>>? _future;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  void _fetch() {
    setState(() {
      _future = ref
          .read(apiClientProvider)
          .get(
            '/inventory/stock-balances',
            queryParameters: {if (_productId != null) 'productId': _productId, if (_warehouseId != null) 'warehouseId': _warehouseId},
          )
          .then((data) => (data as List).cast<Map<String, dynamic>>());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Stock Balances')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: FkPickerField(
                    field: _productFilterField,
                    value: _productId,
                    onChanged: (v) {
                      _productId = v;
                      _fetch();
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FkPickerField(
                    field: _warehouseFilterField,
                    value: _warehouseId,
                    onChanged: (v) {
                      _warehouseId = v;
                      _fetch();
                    },
                  ),
                ),
                if (_productId != null || _warehouseId != null)
                  IconButton(
                    tooltip: 'Clear filters',
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _productId = null;
                      _warehouseId = null;
                      _fetch();
                    },
                  ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  final error = snapshot.error;
                  final message = error is ApiException ? error.message : error.toString();
                  return Center(child: Text('Could not load data: $message'));
                }
                final rows = snapshot.data ?? [];
                if (rows.isEmpty) return const Center(child: Text('No stock balances yet.'));
                return ListView.separated(
                  itemCount: rows.length,
                  separatorBuilder: (_, _) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final row = rows[index];
                    final location = [row['rackName'], row['locationName']].where((v) => v != null).join(' / ');
                    return ListTile(
                      title: Text('${row['productName']} (${row['sku']})'),
                      subtitle: Text(
                        '${row['warehouseName']}'
                        '${location.isEmpty ? '' : ' · $location'}'
                        '${row['batchNumber'] != null ? ' · Batch: ${row['batchNumber']}' : ''}',
                      ),
                      trailing: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Qty: ${row['quantity']}'),
                          Text('Available: ${row['availableQuantity']}', style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
