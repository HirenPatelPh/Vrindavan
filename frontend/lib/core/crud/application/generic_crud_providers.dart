import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../providers/core_providers.dart';
import '../generic_crud_api.dart';

part 'generic_crud_providers.g.dart';

@riverpod
GenericCrudApi genericCrudApi(Ref ref, String resourcePath) =>
    GenericCrudApi(ref.watch(apiClientProvider), resourcePath);

/// One list per resource path, e.g. `entityListProvider('warehouses')`. Callers invalidate this
/// after create/update/delete to refetch — there's no server-side pagination to page through,
/// every list call already returns the full table (confirmed across all 14 controllers).
@riverpod
Future<List<Map<String, dynamic>>> entityList(Ref ref, String resourcePath) =>
    ref.watch(genericCrudApiProvider(resourcePath)).list();
