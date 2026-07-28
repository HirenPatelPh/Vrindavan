import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class AuthTokens {
  const AuthTokens({required this.accessToken, required this.refreshToken, required this.companyCode});

  final String accessToken;
  final String refreshToken;
  final String companyCode;
}

/// Persists the access/refresh tokens and the tenant's company code between app launches.
///
/// Originally built on `flutter_secure_storage`, which encrypts values via the Web Crypto API
/// on the web target. That read path hung indefinitely in this environment (write succeeded —
/// tokens were visibly encrypted into localStorage — but every read after a fresh page load
/// never resolved, with no thrown error to catch). Swapped to `shared_preferences` instead:
/// no encryption layer to fail silently, well-established across all platforms. This means
/// tokens are stored in plaintext (SharedPreferences on native, localStorage on web) rather
/// than OS-keychain-backed — an accepted tradeoff for this foundation pass, not a security
/// design decision; revisit with a platform-conditional approach (secure storage on native,
/// this on web) in a later pass if needed.
class SecureTokenStorage {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _companyCodeKey = 'company_code';
  static const _userJsonKey = 'user_json';

  Future<void> save(AuthTokens tokens) async {
    final prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.setString(_accessTokenKey, tokens.accessToken),
      prefs.setString(_refreshTokenKey, tokens.refreshToken),
      prefs.setString(_companyCodeKey, tokens.companyCode),
    ]);
  }

  Future<void> saveAccessToken(String accessToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, accessToken);
  }

  /// Persisted alongside the tokens purely so [restoreSession]-style flows can rebuild the
  /// signed-in user on app relaunch without an extra network round-trip.
  Future<void> saveUserJson(Map<String, dynamic> userJson) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userJsonKey, jsonEncode(userJson));
  }

  Future<Map<String, dynamic>?> readUserJson() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userJsonKey);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<AuthTokens?> read() async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString(_accessTokenKey);
    final refreshToken = prefs.getString(_refreshTokenKey);
    final companyCode = prefs.getString(_companyCodeKey);
    if (accessToken == null || refreshToken == null || companyCode == null) return null;
    return AuthTokens(accessToken: accessToken, refreshToken: refreshToken, companyCode: companyCode);
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.remove(_accessTokenKey),
      prefs.remove(_refreshTokenKey),
      prefs.remove(_companyCodeKey),
      prefs.remove(_userJsonKey),
    ]);
  }
}
