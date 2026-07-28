import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../api/api_client.dart';
import '../storage/secure_token_storage.dart';

part 'core_providers.g.dart';

@Riverpod(keepAlive: true)
SecureTokenStorage secureTokenStorage(Ref ref) => SecureTokenStorage();

@Riverpod(keepAlive: true)
ApiClient apiClient(Ref ref) => ApiClient(tokenStorage: ref.watch(secureTokenStorageProvider));
