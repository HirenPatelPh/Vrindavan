/// Mirrors the backend's AllExceptionsFilter envelope: `{ statusCode, path, timestamp,
/// message, error }`, where `message` may be a single string or (for class-validator
/// failures) an array of strings — normalized here into one displayable string.
class ApiException implements Exception {
  ApiException({required this.statusCode, required this.message, this.error});

  factory ApiException.fromResponseData(int statusCode, dynamic data) {
    if (data is Map<String, dynamic>) {
      final rawMessage = data['message'];
      final message = rawMessage is List
          ? rawMessage.join('\n')
          : (rawMessage?.toString() ?? 'Something went wrong.');
      return ApiException(statusCode: statusCode, message: message, error: data['error']?.toString());
    }
    return ApiException(statusCode: statusCode, message: 'Something went wrong.');
  }

  factory ApiException.network() =>
      ApiException(statusCode: 0, message: 'Could not reach the server. Check your connection and try again.');

  final int statusCode;
  final String message;
  final String? error;

  bool get isUnauthorized => statusCode == 401;

  @override
  String toString() => message;
}
