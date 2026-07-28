import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/secure_token_storage.dart';
import 'api_exception.dart';

/// Set on a [RequestOptions.extra] to skip attaching the stored Authorization/x-company-code
/// headers — used by login/signup, which authenticate *before* any token exists.
const _skipAuthKey = 'skipAuth';

/// Thin wrapper around the backend's REST conventions: attaches auth headers, unwraps the
/// `{ data: ... }` success envelope, maps the `{ statusCode, message, error }` error envelope
/// to [ApiException], and transparently refreshes an expired access token once before giving
/// up and forcing a logout via [onSessionExpired].
class ApiClient {
  ApiClient({required this._tokenStorage}) {
    _dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl, connectTimeout: const Duration(seconds: 15)));
    // Separate instance for the refresh call itself — must never carry the interceptor's
    // auth-header/401-retry logic, or a failed refresh could recurse into itself.
    _refreshDio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl, connectTimeout: const Duration(seconds: 15)));

    _dio.interceptors.add(InterceptorsWrapper(onRequest: _onRequest, onError: _onError));
  }

  final SecureTokenStorage _tokenStorage;

  /// Wired once at app bootstrap (see app.dart) rather than passed in the constructor — doing
  /// it there instead of here avoids a circular import between core/api and the auth feature's
  /// provider (ApiClient needs to notify auth on session death; auth needs ApiClient to make
  /// calls).
  Future<void> Function()? onSessionExpired;
  late final Dio _dio;
  late final Dio _refreshDio;

  Future<void> _onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    if (options.extra[_skipAuthKey] != true) {
      final tokens = await _tokenStorage.read();
      if (tokens != null) {
        options.headers['Authorization'] = 'Bearer ${tokens.accessToken}';
        options.headers['x-company-code'] = tokens.companyCode;
      }
    }
    handler.next(options);
  }

  Future<void> _onError(DioException err, ErrorInterceptorHandler handler) async {
    final isAuthRetry = err.requestOptions.extra['isAuthRetry'] == true;
    if (err.response?.statusCode == 401 && !isAuthRetry && err.requestOptions.extra[_skipAuthKey] != true) {
      final refreshed = await _tryRefresh();
      if (refreshed != null) {
        final retryOptions = err.requestOptions;
        retryOptions.extra['isAuthRetry'] = true;
        retryOptions.headers['Authorization'] = 'Bearer $refreshed';
        try {
          final response = await _dio.fetch(retryOptions);
          return handler.resolve(response);
        } on DioException catch (retryErr) {
          return handler.next(retryErr);
        }
      }
      await _tokenStorage.clear();
      await onSessionExpired?.call();
    }
    handler.next(err);
  }

  /// Returns the new access token on success, or null if the refresh itself failed.
  Future<String?> _tryRefresh() async {
    final tokens = await _tokenStorage.read();
    if (tokens == null) return null;
    try {
      final response = await _refreshDio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': tokens.refreshToken},
      );
      final data = response.data?['data'] as Map<String, dynamic>?;
      if (data == null) return null;
      final newAccessToken = data['accessToken'] as String;
      final newRefreshToken = data['refreshToken'] as String;
      await _tokenStorage.save(
        AuthTokens(accessToken: newAccessToken, refreshToken: newRefreshToken, companyCode: tokens.companyCode),
      );
      return newAccessToken;
    } on DioException {
      return null;
    }
  }

  ApiException _mapError(DioException e) {
    if (e.response != null) return ApiException.fromResponseData(e.response!.statusCode ?? 0, e.response!.data);
    return ApiException.network();
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(path, queryParameters: queryParameters);
      return response.data?['data'];
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  /// [companyCode] and [skipAuth] are for login/signup, which authenticate before any stored
  /// token/company code exists — every other caller relies on the interceptor to attach them.
  Future<dynamic> post(
    String path, {
    Map<String, dynamic>? data,
    String? companyCode,
    bool skipAuth = false,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        path,
        data: data,
        options: Options(
          headers: companyCode != null ? {'x-company-code': companyCode} : null,
          extra: {_skipAuthKey: skipAuth},
        ),
      );
      return response.data?['data'];
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  /// For multipart uploads (e.g. product images) — same interceptor chain (auth headers,
  /// error mapping) as [post], just accepts pre-built [FormData] instead of a JSON map.
  Future<dynamic> postFormData(String path, {required FormData formData}) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(path, data: formData);
      return response.data?['data'];
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> patch(String path, {Map<String, dynamic>? data}) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(path, data: data);
      return response.data?['data'];
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> put(String path, {Map<String, dynamic>? data}) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(path, data: data);
      return response.data?['data'];
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  Future<void> delete(String path) async {
    try {
      await _dio.delete<void>(path);
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }
}
