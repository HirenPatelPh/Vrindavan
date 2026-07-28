import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

/// Mirrors GRN's role on the purchase side: the one document that actually posts to stock
/// (`sales_out`, base-unit converted). Approve-equivalent route is `deliver`, not `approve`; no
/// cancel route exists for this resource. Carries no pricing at all — no `rate`/`gstId` on
/// lines, no [DocumentSpec.summaryFields]. Line-level `soLineId` (optional traceability to a
/// specific SO line) is intentionally omitted, same reasoning as GRN's `poLineId`.
final deliveryChallanSpec = DocumentSpec(
  resourcePath: 'sales/delivery-challans',
  useDataGrid: true,
  pageSize: 12,
  title: 'Delivery Challans',
  numberKey: 'dcNumber',
  approveRoute: 'deliver',
  approveLabel: 'Deliver',
  headerFields: const [
    FieldSpec(key: 'soId', label: 'Sales order (optional)', type: FieldType.dropdownFk, fkResource: 'sales/sales-orders', fkLabelKey: 'soNumber'),
    FieldSpec(key: 'customerId', label: 'Customer', type: FieldType.dropdownFk, required: true, fkResource: 'customers'),
    FieldSpec(key: 'warehouseId', label: 'Warehouse', type: FieldType.dropdownFk, required: true, fkResource: 'warehouses'),
    FieldSpec(key: 'transporterId', label: 'Transporter (optional)', type: FieldType.dropdownFk, fkResource: 'transporters'),
    FieldSpec(key: 'dcDate', label: 'DC date', type: FieldType.date),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'productUnitId', label: 'Unit', type: FieldType.dropdownFk, required: true, fkResource: 'products'),
    FieldSpec(key: 'batchId', label: 'Batch (optional)', type: FieldType.dropdownFk, fkResource: 'products'),
    FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
);
