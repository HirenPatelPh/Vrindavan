import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/providers/core_providers.dart';
import '../data/auth_api.dart';
import '../data/auth_repository_impl.dart';
import '../domain/auth_repository.dart';

part 'auth_provider.g.dart';

@riverpod
AuthApi authApi(Ref ref) => AuthApi(ref.watch(apiClientProvider));

@riverpod
AuthRepository authRepository(Ref ref) =>
    AuthRepositoryImpl(authApi: ref.watch(authApiProvider), tokenStorage: ref.watch(secureTokenStorageProvider));

/// The single source of truth for "who's signed in" — null means unauthenticated. go_router's
/// redirect guard (core/router/app_router.dart) watches this to decide login vs. app shell.
@riverpod
class Auth extends _$Auth {
  @override
  Future<AuthSession?> build() {
    return ref.watch(authRepositoryProvider).restoreSession();
  }

  Future<void> login({required String companyCode, required String email, required String password}) async {
    state = const AsyncLoading();
    try {
      final session = await ref.read(authRepositoryProvider).login(
            companyCode: companyCode,
            email: email,
            password: password,
          );
      state = AsyncData(session);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> signup({
    required String companyCode,
    required String companyName,
    required String companyEmail,
    required String adminName,
    required String adminEmail,
    required String adminPassword,
  }) async {
    state = const AsyncLoading();
    try {
      final session = await ref.read(authRepositoryProvider).signup(
            companyCode: companyCode,
            companyName: companyName,
            companyEmail: companyEmail,
            adminName: adminName,
            adminEmail: adminEmail,
            adminPassword: adminPassword,
          );
      state = AsyncData(session);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(null);
  }

  /// Called by ApiClient.onSessionExpired (wired in app.dart) when a refresh attempt fails —
  /// tokens are already cleared by ApiClient at that point, this just updates in-memory state
  /// so the router's redirect guard reacts immediately instead of on the next navigation.
  void forceLogout() {
    state = const AsyncData(null);
  }
}
