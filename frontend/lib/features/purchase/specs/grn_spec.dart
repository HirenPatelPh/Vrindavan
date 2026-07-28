import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

/// Goods Received Note — the one document whose approve-equivalent route is named `complete`,
/// not `approve`. Carries no money fields at all (no [DocumentSpec.summaryFields]) — it's a
/// receipt document, tax/totals only appear on the Purchase Invoice. Line-level `poLineId`
/// (optional traceability back to a specific PO line) is intentionally omitted — no backend
/// endpoint lists a PO's lines independently of fetching the whole PO.
final grnSpec = DocumentSpec(
  resourcePath: 'purchase/goods-received-notes',
  useDataGrid: true,
  pageSize: 12,
  title: 'Goods Received Notes',
  numberKey: 'grnNumber',
  approveRoute: 'complete',
  approveLabel: 'Complete',
  headerFields: const [
    FieldSpec(key: 'poId', label: 'Purchase order (optional)', type: FieldType.dropdownFk, fkResource: 'purchase/purchase-orders', fkLabelKey: 'poNumber'),
    FieldSpec(key: 'supplierId', label: 'Supplier', type: FieldType.dropdownFk, required: true, fkResource: 'suppliers'),
    FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'transporterId', label: 'Transporter (optional)', type: FieldType.dropdownFk, fkResource: 'transporters'),
    FieldSpec(key: 'grnDate', label: 'GRN date', type: FieldType.date),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'productUnitId', label: 'Unit', type: FieldType.dropdownFk, required: true, fkResource: 'products'),
    FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
    FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'rate', label: 'Rate', type: FieldType.decimal, required: true),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
);
