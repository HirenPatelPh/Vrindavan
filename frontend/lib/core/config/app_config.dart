/// Environment-configured settings. Override at build/run time with
/// `--dart-define=API_BASE_URL=https://api.example.com/api`.
class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  /// Static files (e.g. product images) are served from the API host but outside the `/api`
  /// prefix (see backend `ServeStaticModule` config, `serveRoot: /uploads`) — strip the trailing
  /// `/api` to get the right origin to prepend to a returned `imageUrl` like `/uploads/...`.
  static final String mediaOrigin = apiBaseUrl.endsWith('/api')
      ? apiBaseUrl.substring(0, apiBaseUrl.length - '/api'.length)
      : apiBaseUrl;
}
