import '../../../core/api/api_client.dart';

/// Raw calls to the backend's `/auth` and `/auth/signup` endpoints
/// (backend/src/modules/auth/presentation/auth.controller.ts,
/// backend/src/modules/signup/presentation/signup.controller.ts). Returns the unwrapped
/// `AuthResponseDto` JSON as-is; parsing into domain types happens in AuthRepositoryImpl.
class AuthApi {
  AuthApi(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> login({
    required String companyCode,
    required String email,
    required String password,
  }) async {
    final data = await _client.post(
      '/auth/login',
      data: {'email': email, 'password': password},
      companyCode: companyCode,
      skipAuth: true,
    );
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> signup({
    required String companyCode,
    required String companyName,
    required String companyEmail,
    required String adminName,
    required String adminEmail,
    required String adminPassword,
  }) async {
    final data = await _client.post(
      '/auth/signup',
      data: {
        'companyCode': companyCode,
        'companyName': companyName,
        'companyEmail': companyEmail,
        'adminName': adminName,
        'adminEmail': adminEmail,
        'adminPassword': adminPassword,
      },
      skipAuth: true,
    );
    return data as Map<String, dynamic>;
  }

  Future<void> logout(String refreshToken) async {
    await _client.post('/auth/logout', data: {'refreshToken': refreshToken});
  }
}
