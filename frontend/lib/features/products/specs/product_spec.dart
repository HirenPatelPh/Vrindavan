import '../../../core/crud/column_spec.dart';
import '../../../core/crud/entity_spec.dart';
import '../../../core/crud/field_spec.dart';
import '../../../core/crud/format_helpers.dart';

/// Products-core is a flat, uniform resource (`GET/POST /products`, `GET/PATCH/DELETE
/// /products/:id`) — it drives the generic list/form screens exactly like the 15 master-data
/// modules. `routeBase: '/products'` sends list-row taps to [ProductDetailScreen] instead of the
/// generic edit form, since a product also owns nested Images/Units/Batches/Barcodes/Price
/// History collections that need their own screen.
final productSpec = EntitySpec(
  resourcePath: 'products',
  title: 'Products',
  routeBase: '/products',
  useDataGrid: true,
  pageSize: 12,
  searchableKeys: const ['name', 'sku', 'barcode'],
  listColumns: [
    ColumnSpec(label: 'SKU', format: (r) => orDash(r['sku'])),
    ColumnSpec(label: 'Selling price', format: (r) => '₹${r['sellingPrice']}'),
    ColumnSpec(label: 'Reorder level', format: (r) => '${r['reorderLevel']}'),
    ColumnSpec(label: 'Status', format: activeLabel),
  ],
  formFields: const [
    FieldSpec(key: 'name', label: 'Name', type: FieldType.text, required: true, maxLength: 200),
    FieldSpec(key: 'sku', label: 'SKU', type: FieldType.text, required: true, maxLength: 50),
    FieldSpec(key: 'barcode', label: 'Barcode', type: FieldType.text, maxLength: 50),
    FieldSpec(key: 'qrCode', label: 'QR code', type: FieldType.text, maxLength: 100),
    FieldSpec(key: 'categoryId', label: 'Category', type: FieldType.dropdownFk, required: true, fkResource: 'categories'),
    FieldSpec(key: 'subCategoryId', label: 'Sub-category', type: FieldType.dropdownFk, fkResource: 'sub-categories'),
    FieldSpec(key: 'brandId', label: 'Brand', type: FieldType.dropdownFk, fkResource: 'brands'),
    FieldSpec(
      key: 'hsnId',
      label: 'HSN code',
      type: FieldType.dropdownFk,
      fkResource: 'hsn-codes',
      fkLabelKey: 'code',
      fkCodeKey: 'description',
    ),
    FieldSpec(key: 'gstId', label: 'GST rate', type: FieldType.dropdownFk, fkResource: 'gst-rates'),
    FieldSpec(
      key: 'baseUnitId',
      label: 'Base unit',
      type: FieldType.dropdownFk,
      required: true,
      fkResource: 'units',
      fkCodeKey: 'shortCode',
    ),
    FieldSpec(key: 'purchasePrice', label: 'Purchase price', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'sellingPrice', label: 'Selling price', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'mrp', label: 'MRP', type: FieldType.decimal),
    FieldSpec(key: 'minimumStock', label: 'Minimum stock', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'maximumStock', label: 'Maximum stock', type: FieldType.decimal),
    FieldSpec(key: 'reorderLevel', label: 'Reorder level', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'openingStock', label: 'Opening stock', type: FieldType.decimal, defaultValue: 0),
    FieldSpec(key: 'piecesPerBox', label: 'Pieces per box', type: FieldType.integer),
    FieldSpec(key: 'piecesPerBag', label: 'Pieces per bag', type: FieldType.integer),
    FieldSpec(key: 'weight', label: 'Weight', type: FieldType.decimal),
    FieldSpec(key: 'weightUnit', label: 'Weight unit', type: FieldType.text, maxLength: 10),
    FieldSpec(key: 'dimensionLength', label: 'Length', type: FieldType.decimal),
    FieldSpec(key: 'dimensionWidth', label: 'Width', type: FieldType.decimal),
    FieldSpec(key: 'dimensionHeight', label: 'Height', type: FieldType.decimal),
    FieldSpec(key: 'dimensionUnit', label: 'Dimension unit', type: FieldType.text, maxLength: 10),
    FieldSpec(key: 'hasBatchTracking', label: 'Batch tracking', type: FieldType.boolean, defaultValue: false),
    FieldSpec(key: 'hasExpiryTracking', label: 'Expiry tracking', type: FieldType.boolean, defaultValue: false),
    FieldSpec(key: 'remarks', label: 'Remarks', type: FieldType.longText),
    FieldSpec(key: 'isActive', label: 'Active', type: FieldType.boolean, defaultValue: true),
  ],
);
