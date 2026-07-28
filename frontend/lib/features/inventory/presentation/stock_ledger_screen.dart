import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
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
const _limitOptions = [50, 100, 200, 500];

/// Read-only report over `stock_ledger` — unlike Stock Balances, the response only carries raw
/// FK ids, so this resolves `productId`/`warehouseId` to names via the same watch-and-find-by-id
/// pattern used everywhere else in the app.
class StockLedgerScreen extends ConsumerStatefulWidget {
  const StockLedgerScreen({super.key});

  @override
  ConsumerState<StockLedgerScreen> createState() => _StockLedgerScreenState();
}

class _StockLedgerScreenState extends ConsumerState<StockLedgerScreen> {
  String? _productId;
  String? _warehouseId;
  int _limit = 100;
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
            '/inventory/stock-ledger',
            queryParameters: {
              if (_productId != null) 'productId': _productId,
              if (_warehouseId != null) 'warehouseId': _warehouseId,
              'limit': _limit,
            },
          )
          .then((data) => (data as List).cast<Map<String, dynamic>>());
    });
  }

  String _nameOf(AsyncValue<List<Map<String, dynamic>>> async, String? id) {
    if (id == null) return '—';
    return async.maybeWhen(
      data: (records) {
        for (final r in records) {
          if (r['id'] == id) return r['name']?.toString() ?? id;
        }
        return id;
      },
      orElse: () => 'Loading…',
    );
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(entityListProvider('products'));
    final warehousesAsync = ref.watch(entityListProvider('warehouses'));

    return Scaffold(
      appBar: AppBar(title: const Text('Stock Ledger')),
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
                const SizedBox(width: 12),
                DropdownButton<int>(
                  value: _limit,
                  items: [for (final n in _limitOptions) DropdownMenuItem(value: n, child: Text('Last $n'))],
                  onChanged: (v) {
                    if (v == null) return;
                    _limit = v;
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
                if (rows.isEmpty) return const Center(child: Text('No ledger entries yet.'));
                return ListView.separated(
                  itemCount: rows.length,
                  separatorBuilder: (_, _) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final row = rows[index];
                    final qtyIn = (row['qtyIn'] as num?) ?? 0;
                    final qtyOut = (row['qtyOut'] as num?) ?? 0;
                    final product = _nameOf(productsAsync, row['productId'] as String?);
                    final warehouse = _nameOf(warehousesAsync, row['warehouseId'] as String?);
                    final createdAt = row['createdAt']?.toString().replaceFirst('T', ' ').split('.').first ?? '';
                    return ListTile(
                      title: Text('${row['movementType']} · $product'),
                      subtitle: Text('$warehouse · $createdAt · Unit cost: ₹${row['unitCost']}'),
                      trailing: Text(
                        qtyIn > 0 ? '+$qtyIn' : '-$qtyOut',
                        style: TextStyle(
                          color: qtyIn > 0 ? Colors.green.shade700 : Colors.red.shade700,
                          fontWeight: FontWeight.bold,
                        ),
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
