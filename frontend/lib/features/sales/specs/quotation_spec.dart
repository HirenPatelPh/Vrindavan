import '../../../core/crud/field_spec.dart';
import '../../../core/documents/document_spec.dart';

/// Only used by `DocumentListScreen`/`DocumentFormScreen` (list + create) — neither reads
/// `approveRoute`/`approveLabel`, both left null since Quotation has no single approve action.
/// Its `:id` route goes to a hand-written `QuotationDetailScreen` instead of the generic
/// `DocumentDetailScreen`, which is why this spec is deliberately excluded from
/// `salesDocumentSpecs` (the router wires it separately).
final quotationSpec = DocumentSpec(
  resourcePath: 'sales/quotations',
  useDataGrid: true,
  pageSize: 12,
  title: 'Quotations',
  numberKey: 'quotationNumber',
  headerFields: const [
    FieldSpec(key: 'customerId', label: 'Customer', type: FieldType.dropdownFk, required: true, fkResource: 'customers'),
    FieldSpec(key: 'quotationDate', label: 'Quotation date', type: FieldType.date),
    FieldSpec(key: 'validUntil', label: 'Valid until', type: FieldType.date),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
  ],
  lineFields: const [
    FieldSpec(key: 'productId', label: 'Product', type: FieldType.dropdownFk, required: true, fkResource: 'products', fkCodeKey: 'sku'),
    FieldSpec(key: 'productUnitId', label: 'Unit', type: FieldType.dropdownFk, required: true, fkResource: 'products'),
    FieldSpec(key: 'quantity', label: 'Quantity', type: FieldType.decimal, required: true),
    FieldSpec(key: 'rate', label: 'Rate', type: FieldType.decimal, required: true),
    FieldSpec(key: 'discountPercent', label: 'Discount %', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'gstId', label: 'GST rate (optional)', type: FieldType.dropdownFk, fkResource: 'gst-rates'),
  ],
);
