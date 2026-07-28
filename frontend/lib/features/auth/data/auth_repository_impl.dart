import '../../../core/storage/secure_token_storage.dart';
import '../domain/auth_repository.dart';
import '../domain/user.dart';
import 'auth_api.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({required this._authApi, required this._tokenStorage});

  final AuthApi _authApi;
  final SecureTokenStorage _tokenStorage;

  Future<AuthSession> _persistAndBuildSession(Map<String, dynamic> response, String companyCode) async {
    final userJson = response['user'] as Map<String, dynamic>;
    final tokens = AuthTokens(
      accessToken: response['accessToken'] as String,
      refreshToken: response['refreshToken'] as String,
      companyCode: companyCode,
    );
    await _tokenStorage.save(tokens);
    await _tokenStorage.saveUserJson(userJson);
    return AuthSession(user: AppUser.fromJson(userJson), companyCode: companyCode);
  }

  @override
  Future<AuthSession> login({required String companyCode, required String email, required String password}) async {
    final response = await _authApi.login(companyCode: companyCode, email: email, password: password);
    return _persistAndBuildSession(response, companyCode);
  }

  @override
  Future<AuthSession> signup({
    required String companyCode,
    required String companyName,
    required String companyEmail,
    required String adminName,
    required String adminEmail,
    required String adminPassword,
  }) async {
    final response = await _authApi.signup(
      companyCode: companyCode,
      companyName: companyName,
      companyEmail: companyEmail,
      adminName: adminName,
      adminEmail: adminEmail,
      adminPassword: adminPassword,
    );
    return _persistAndBuildSession(response, companyCode);
  }

  @override
  Future<void> logout() async {
    final tokens = await _tokenStorage.read();
    if (tokens != null) {
      // Best-effort: an already-expired/invalid refresh token shouldn't block local logout.
      try {
        await _authApi.logout(tokens.refreshToken);
      } catch (_) {
        // ignore
      }
    }
    await _tokenStorage.clear();
  }

  @override
  Future<AuthSession?> restoreSession() async {
    final tokens = await _tokenStorage.read();
    final userJson = await _tokenStorage.readUserJson();
    if (tokens == null || userJson == null) return null;
    return AuthSession(user: AppUser.fromJson(userJson), companyCode: tokens.companyCode);
  }
}
