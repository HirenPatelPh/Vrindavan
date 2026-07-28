import 'user.dart';

class AuthSession {
  const AuthSession({required this.user, required this.companyCode});

  final AppUser user;
  final String companyCode;
}

abstract class AuthRepository {
  Future<AuthSession> login({required String companyCode, required String email, required String password});

  Future<AuthSession> signup({
    required String companyCode,
    required String companyName,
    required String companyEmail,
    required String adminName,
    required String adminEmail,
    required String adminPassword,
  });

  Future<void> logout();

  /// Restores a session from previously persisted tokens, if any (app relaunch). Does not
  /// hit the network — the stored access token is trusted until a request 401s, at which
  /// point ApiClient's refresh-or-logout flow takes over.
  Future<AuthSession?> restoreSession();
}
