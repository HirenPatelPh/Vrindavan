import 'column_spec.dart';
import 'field_spec.dart';

/// Declarative description of one master-data module, driving the generic list/form screens.
/// See `lib/features/master_data/specs/` for the 14 concrete instances.
class EntitySpec {
  const EntitySpec({
    required this.resourcePath,
    required this.title,
    required this.listColumns,
    required this.formFields,
    this.searchableKeys = const [],
    this.routeBase,
    this.useDataGrid = false,
    this.pageSize,
  });

  /// URL path segment and REST resource, e.g. `'warehouses'` -> `/api/warehouses`.
  final String resourcePath;

  final String title;
  final List<ColumnSpec> listColumns;
  final List<FieldSpec> formFields;

  /// Record keys searched (case-insensitive substring) by the list screen's search box.
  final List<String> searchableKeys;

  /// Base route path for this resource's list/new/detail screens. Defaults to
  /// `/master/<resourcePath>` when null — set explicitly (e.g. `/products`) when a resource
  /// needs its list rows to open something other than the generic edit form (see
  /// [GenericListScreen]'s row-tap target).
  final String? routeBase;

  /// When true, [GenericListScreen] renders a sortable/resizable/filterable [PlutoGrid] table
  /// instead of the default `ListTile` list. Opt-in and off by default so existing modules are
  /// unaffected — currently only [productSpec] sets this, as a scoped trial ahead of a possible
  /// rollout to the other modules once confirmed.
  final bool useDataGrid;

  /// When set (only meaningful alongside [useDataGrid]), [GenericListScreen] fetches this
  /// resource page-by-page from the server (`?page=&limit=`) instead of via [entityListProvider]
  /// — the backend only returns a paginated `{items, total}` shape when `page` is present, so
  /// this never changes behavior for the plain-list/FK-picker consumers of the same resource.
  /// This is also the grid's default/initial page size.
  final int? pageSize;
}
