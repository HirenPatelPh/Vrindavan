/// Environment-configured settings.
///
/// The API base URL resolves in this order:
///  1. A compile-time `--dart-define=API_BASE_URL=...` (explicit override, e.g. a native build).
///  2. Otherwise **same-origin**, derived from the page the app was served from — so one web
///     build serves every tenant subdomain (`vrindavan.enrix.in` calls `vrindavan.enrix.in/api`).
///     For localhost dev the backend runs on :3000, so we point there instead of the dev-server port.
class AppConfig {
  AppConfig._();

  static const String _compiledBase = String.fromEnvironment('API_BASE_URL', defaultValue: '');

  static final String apiBaseUrl = _compiledBase.isNotEmpty ? _compiledBase : _sameOriginApi();

  static String _sameOriginApi() {
    final base = Uri.base;
    if (base.scheme == 'http' || base.scheme == 'https') {
      final host = base.host;
      // Local dev convenience: the NestJS backend listens on :3000, not the Flutter dev-server port.
      if (host == 'localhost' || host == '127.0.0.1') return 'http://$host:3000/api';
      return '${base.origin}/api';
    }
    // Non-web / no origin (native without an override) — fall back to localhost.
    return 'http://localhost:3000/api';
  }

  /// Static files (e.g. product images) are served from the API host but outside the `/api`
  /// prefix (see backend `ServeStaticModule` config, `serveRoot: /uploads`) — strip the trailing
  /// `/api` to get the right origin to prepend to a returned `imageUrl` like `/uploads/...`.
  static final String mediaOrigin = apiBaseUrl.endsWith('/api')
      ? apiBaseUrl.substring(0, apiBaseUrl.length - '/api'.length)
      : apiBaseUrl;
}
