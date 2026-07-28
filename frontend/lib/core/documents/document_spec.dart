import '../crud/field_spec.dart';

/// Declarative description of one of the 5 draft→approve Inventory document types (Stock
/// Transfers, Stock Adjustments, Physical Verifications, Damaged Stock, Stock Returns) — all
/// share one shape: a header + a `lines: [...]` array, created as `draft`, with a single
/// approve-style action that's the only way out of `draft`, and delete only while `draft`. See
/// `lib/features/inventory/specs/` for the 5 concrete instances.
class DocumentSpec {
  const DocumentSpec({
    required this.resourcePath,
    required this.title,
    required this.numberKey,
    required this.headerFields,
    required this.lineFields,
    this.approveRoute,
    this.approveLabel,
    this.approveFromStatuses = const ['draft'],
    this.cancelRoute,
    this.cancelLabel,
    this.cancelFromStatuses = const [],
    this.summaryFields = const [],
    this.useDataGrid = false,
    this.pageSize,
  });

  /// URL path segment and REST resource, e.g. `'inventory/stock-transfers'`.
  final String resourcePath;

  final String title;

  /// Record key shown as the list/detail title, e.g. `'transferNumber'`.
  final String numberKey;

  final List<FieldSpec> headerFields;
  final List<FieldSpec> lineFields;

  /// `'approve'` for most types, `'complete'` for Physical Verifications and GRN. Null means no
  /// Approve action at all — only Quotation, which is routed to a hand-written detail screen
  /// instead of [DocumentDetailScreen] (its lifecycle is `send`/`accept`/`reject`/`convert`, not
  /// a single approve), leaves these null. [DocumentListScreen]/[DocumentFormScreen] never read
  /// these two fields, so Quotation still reuses both unmodified for list/create.
  final String? approveRoute;
  final String? approveLabel;

  /// Statuses from which the Approve/Complete button is shown. Every document so far only
  /// leaves `draft` this way, so the default covers all of them unchanged.
  final List<String> approveFromStatuses;

  /// Optional second lifecycle action beyond approve — only Purchase Order uses this
  /// (`.../cancel`, valid from `draft` or `approved`). Null means no Cancel button at all.
  final String? cancelRoute;
  final String? cancelLabel;
  final List<String> cancelFromStatuses;

  /// Record keys shown as extra `label: ₹value` stat chips in [DocumentDetailScreen] alongside
  /// the Status chip — e.g. `['totalAmount']`. Empty for documents with no money fields.
  final List<String> summaryFields;

  /// When true, [DocumentListScreen] renders a sortable/resizable [PlutoGrid] instead of the
  /// plain `ListTile` list — mirrors [EntitySpec.useDataGrid].
  final bool useDataGrid;

  /// When set (with [useDataGrid]), [DocumentListScreen] paginates: default/initial page size.
  /// The fetch handles both a server `{items, total}` envelope and a plain array (client-slice
  /// fallback), same as [GenericListScreen].
  final int? pageSize;
}
