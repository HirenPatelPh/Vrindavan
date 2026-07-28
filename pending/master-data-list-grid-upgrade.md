# Pending: Replace Master Data list UI with a proper data grid

**Status:** SCOPED TRIAL LIVE on Products only. Awaiting user confirmation before rolling out to
the other 15 `GenericListScreen`-driven modules (14 master-data + Units).
**Raised:** 2026-07-19
**Trial implemented:** 2026-07-19
**Area:** Frontend (`frontend/lib/core/crud/presentation/generic_list_screen.dart`)

## The ask

Current Master Data list screens (Branches, Sub-categories, Suppliers, etc.) render as a plain
`ListView` of `ListTile`s — title + a subtitle string of `key: value` pairs (see screenshot
context: Sub-categories list showing "Ceramic Floor Tiles / Code: CFT · Status: Active" stacked
rows). User finds this hard to scan and asked for a grid-like structure similar to ag-Grid
(sortable/filterable/resizable columns, proper tabular layout) instead.

## Why this isn't a one-screen tweak

`GenericListScreen` is the **shared engine behind all 15 Master Data modules** (Branches,
Warehouses, Racks, Locations, Categories, Sub-categories, Brands, GST Rates, HSN Codes, Taxes,
Suppliers, Customers, Employees, Transporters, Units) plus a few document list screens built on
the same pattern. Changing it is a shared-component change — fix once, every module benefits —
but it has real blast radius and should be prototyped on one screen before a full rollout.

## Library options discussed

ag-Grid itself is JS-only, no official Flutter port — so the real choice is which Flutter-native
grid package gets closest to that feature set.

| Package | License | Notes |
|---|---|---|
| **pluto_grid** | Free (MIT) | Column pin/resize/reorder, per-column filter row, sorting, row selection, grouping, cell editing. Closest free equivalent to ag-Grid. Actively maintained. **Recommended.** |
| **syncfusion_flutter_datagrid** | Commercial* | Most feature-complete (adds Excel/PDF export, conditional formatting) but Syncfusion's "Community License" only applies under ~$1M revenue / <5 developers — past that it's a paid per-developer license. Real risk for a product being sold to clients. |
| **data_table_2** | Free (MIT) | Lightest upgrade from the plain Flutter `DataTable` already used in the Reports screens — fixed header, sortable columns, better width control. No per-column filtering, no pin/reorder. Doesn't really deliver an "ag-Grid-like" feel. |

Recommendation given to user: **pluto_grid**, with the licensing risk of Syncfusion flagged
explicitly as the reason not to default to the more polished option. User confirmed pluto_grid
and asked for it to land on the **Products page only** first, as a trial, before deciding whether
to extend it to the other 14 master-data modules + Units.

## What was implemented (2026-07-19, Products-only trial)

- Added `pluto_grid: ^8.1.0` to `frontend/pubspec.yaml`.
- Added `EntitySpec.useDataGrid` (`bool`, default `false`) in
  `frontend/lib/core/crud/entity_spec.dart` — opt-in per module, so every other spec is
  byte-for-byte unaffected.
- `GenericListScreen` (`frontend/lib/core/crud/presentation/generic_list_screen.dart`) now
  branches on `spec.useDataGrid`: `_buildList(...)` is the original, untouched `ListView`/
  `ListTile` path (still used by all 15 other specs); `_buildGrid(...)` is the new `PlutoGrid`
  path — one `PlutoColumn` per `ColumnSpec` (all rendered as pre-formatted text, since that's all
  a `ColumnSpec` carries — sorting is therefore lexicographic, not type-aware, a known limitation
  of this first pass), plus a hidden `id` column and an `Actions` column (Open/Delete icon
  buttons, replacing the old trailing delete icon + whole-row tap). `mode: PlutoGridMode.readOnly`
  disables cell editing; `onRowDoubleTap` also opens the record, matching desktop-grid
  conventions.
- `frontend/lib/features/products/specs/product_spec.dart` sets `useDataGrid: true` — the only
  spec that does.
- Verified via Playwright against the live seeded demo tenant (Browser-tool clicks are still
  unreliable on this Flutter/CanvasKit app, same persistent issue noted in every prior phase):
  Products list renders all 19 seeded products in the grid with real data; column drag-resize
  works; clicking a column header re-sorts (string-wise); the row-level Open icon navigates to
  `ProductDetailScreen` correctly; Sub-categories (the screen from the original screenshot) still
  renders as the plain `ListTile` list, confirming the other 15 modules are untouched.
- `flutter analyze`: clean.

## What was added in the follow-up pass (2026-07-19, same day)

User asked for two more things on the Products grid specifically: an Edit icon next to Delete,
and server-side pagination (12 rows/page by default, 20/50/100 selectable, fixed-height grid
with an internal scrollbar instead of the page growing).

- **Edit icon**: Actions column is now Open → Edit → Delete (was Open → Delete). `_editRecord()`
  pushes `'$routeBase/${id}/edit'` (the same route `GenericFormScreen` already served via
  row-tap in the old `ListTile` path). Each icon shrunk to `constraints: BoxConstraints(minWidth:
  32, minHeight: 32), padding: EdgeInsets.zero` — the default 48x48 `IconButton` tap target meant
  3 icons overflowed a 130px column; fixed by widening the column to 150px *and* shrinking the
  buttons.
- **Server-side pagination**: new `EntitySpec.pageSize` (`int?`, default `null`) — only
  `productSpec` sets it (`12`). Backend: `GET /products` gained an **opt-in** `page`/`limit`
  query (`ListProductsQueryDto`, `PaginatedProductResponseDto` — `backend/.../products/
  presentation/`), returning `{items, total, page, limit}` only when `page` is present; omitted
  entirely (as every FK picker across Purchase/Sales/Inventory does), it's byte-for-byte the same
  plain array as before — verified via curl both ways. `ProductKyselyRepository` gained
  `findAllPaginated(offset, limit)` + `count()`; `ProductsService.listPaginated()`.
  Frontend: `GenericListScreen` now has a `_buildPaginatedBody()` path (only reachable when
  `spec.pageSize != null`) that fetches via `ApiClient.get()` directly — bypassing
  `entityListProvider` entirely for Products, so FK pickers pointing at `'products'` elsewhere in
  the app are unaffected. Grid sits in a `SizedBox` fixed to a 12-row-equivalent height
  regardless of the selected page size, so switching to 20/50/100 scrolls *inside* the box
  instead of growing the page — confirmed by screenshot at page-size 100 showing the identical
  box height as page-size 12. Footer row: page-size `DropdownButton` (12/20/50/100) + "Page P of
  N · total" + prev/next `IconButton`s. The search box is **intentionally hidden** on the
  paginated path — it can only see whatever page is currently loaded, and a search box that
  silently misses records on other pages would be actively misleading; server-side search
  (`/products/search?q=`) exists but combining it with pagination wasn't asked for this pass.
  After create/edit/delete, the current page is refetched (`_refreshAfterMutation()`) since the
  global `entityListProvider` invalidation `GenericFormScreen` does on submit doesn't reach this
  local-state fetch.
- Verified via Playwright: page 1 shows 12 rows with "Page 1 of 2 · 19 total"; Next → page 2
  shows the remaining 7; page-size dropdown → 100 → "Page 1 of 1 · 19 total" with the **same**
  fixed box height as before (internal scroll, not page growth); Edit icon on a row opens
  "Edit Products" pre-filled with that product's real data. `flutter analyze` and `tsc --noEmit`
  both clean.
- One environment note, not an app bug: repeatedly launching many separate Playwright browser
  instances against the same long-lived `flutter run -d web-server` dev session eventually wedged
  it into a blank-white-screen state (no console errors, no canvas ever attached) — a known
  instability class for `-d web-server` debug mode under many concurrent DWDS connections, not
  something a real user hitting the deployed app would encounter. Fixed by restarting the dev
  server; unrelated to the pagination/edit-icon changes themselves (confirmed by a clean re-run
  immediately after restart).

## When resumed, next steps (extending beyond Products)

1. Confirm with the user whether/which of the other 14 master-data modules (+ Units) should get
   `useDataGrid: true` — can be done one spec at a time (flip the flag, no `GenericListScreen`
   changes needed) or all at once.
2. Decide whether lexicographic string-sort on formatted values is acceptable long-term, or
   whether `ColumnSpec` needs a typed `sortValue` extractor (e.g. raw numeric/date value) so
   PlutoGrid can sort correctly by type — currently deferred since Products' columns (SKU,
   price, reorder level, status) read fine either way at 19 rows, but larger numeric-heavy grids
   (e.g. Suppliers/Customers with balances) may need it.
3. Consider whether `Name` should remain a hardcoded first column (mirrors old `_displayName`
   logic) or become a declared `ColumnSpec` like every other column, for consistency once more
   modules adopt the grid.
4. If pagination also gets extended to other modules, the same `page`/`limit`-opt-in backend
   pattern used for Products should be repeated per module (each master-data controller would
   need its own `ListXQueryDto`/paginated response DTO — there's no shared pagination helper yet
   since this was Products-only).
5. Decide whether the Products search box should come back as a server-side `q`-plus-pagination
   combined query (would need a small backend change: add `q` to `ListProductsQueryDto` and an
   ILIKE filter alongside the existing `LIMIT/OFFSET`), since it's currently just hidden.
