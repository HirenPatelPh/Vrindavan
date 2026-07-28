import '../api/api_client.dart';

/// Thin REST wrapper over [ApiClient] for any master-data resource — every one of the 14
/// modules exposes the identical `GET/GET :id/POST/PATCH :id/DELETE :id` shape (confirmed
/// against every controller in `backend/src/modules/*/presentation/*.controller.ts`), so a
/// single generic client replaces 14 near-identical hand-written ones. Records are plain
/// `Map<String, dynamic>` rather than per-entity freezed models — these are flat CRUD DTOs with
/// no client-side derived logic, unlike Dashboard's computed widgets.
class GenericCrudApi {
  GenericCrudApi(this._apiClient, this.resourcePath);

  final ApiClient _apiClient;
  final String resourcePath;

  Future<List<Map<String, dynamic>>> list() async {
    final data = await _apiClient.get('/$resourcePath');
    return (data as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> getOne(String id) async {
    final data = await _apiClient.get('/$resourcePath/$id');
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> create(Map<String, dynamic> body) async {
    final data = await _apiClient.post('/$resourcePath', data: body);
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> update(String id, Map<String, dynamic> body) async {
    final data = await _apiClient.patch('/$resourcePath/$id', data: body);
    return data as Map<String, dynamic>;
  }

  Future<void> delete(String id) => _apiClient.delete('/$resourcePath/$id');
}
