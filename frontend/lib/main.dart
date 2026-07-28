import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/providers/core_providers.dart';
import 'features/auth/application/auth_provider.dart';

void main() {
  // Built as a manual ProviderContainer (rather than a plain ProviderScope in runApp) so
  // ApiClient's onSessionExpired callback can be wired to the auth notifier before the first
  // frame — see core/api/api_client.dart's doc comment for why this isn't done via
  // constructor injection (would create a circular import between core/api and the auth
  // feature).
  final container = ProviderContainer();
  container.read(apiClientProvider).onSessionExpired = () async {
    container.read(authProvider.notifier).forceLogout();
  };

  runApp(UncontrolledProviderScope(container: container, child: const App()));
}
