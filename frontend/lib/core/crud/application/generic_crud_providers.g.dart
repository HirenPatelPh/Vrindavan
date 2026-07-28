// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'generic_crud_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(genericCrudApi)
final genericCrudApiProvider = GenericCrudApiFamily._();

final class GenericCrudApiProvider
    extends $FunctionalProvider<GenericCrudApi, GenericCrudApi, GenericCrudApi>
    with $Provider<GenericCrudApi> {
  GenericCrudApiProvider._({
    required GenericCrudApiFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'genericCrudApiProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$genericCrudApiHash();

  @override
  String toString() {
    return r'genericCrudApiProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $ProviderElement<GenericCrudApi> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  GenericCrudApi create(Ref ref) {
    final argument = this.argument as String;
    return genericCrudApi(ref, argument);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(GenericCrudApi value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<GenericCrudApi>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is GenericCrudApiProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$genericCrudApiHash() => r'675eacdea413897c2ccb22f72ab2b701b787ee50';

final class GenericCrudApiFamily extends $Family
    with $FunctionalFamilyOverride<GenericCrudApi, String> {
  GenericCrudApiFamily._()
    : super(
        retry: null,
        name: r'genericCrudApiProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  GenericCrudApiProvider call(String resourcePath) =>
      GenericCrudApiProvider._(argument: resourcePath, from: this);

  @override
  String toString() => r'genericCrudApiProvider';
}

/// One list per resource path, e.g. `entityListProvider('warehouses')`. Callers invalidate this
/// after create/update/delete to refetch — there's no server-side pagination to page through,
/// every list call already returns the full table (confirmed across all 14 controllers).

@ProviderFor(entityList)
final entityListProvider = EntityListFamily._();

/// One list per resource path, e.g. `entityListProvider('warehouses')`. Callers invalidate this
/// after create/update/delete to refetch — there's no server-side pagination to page through,
/// every list call already returns the full table (confirmed across all 14 controllers).

final class EntityListProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<Map<String, dynamic>>>,
          List<Map<String, dynamic>>,
          FutureOr<List<Map<String, dynamic>>>
        >
    with
        $FutureModifier<List<Map<String, dynamic>>>,
        $FutureProvider<List<Map<String, dynamic>>> {
  /// One list per resource path, e.g. `entityListProvider('warehouses')`. Callers invalidate this
  /// after create/update/delete to refetch — there's no server-side pagination to page through,
  /// every list call already returns the full table (confirmed across all 14 controllers).
  EntityListProvider._({
    required EntityListFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'entityListProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$entityListHash();

  @override
  String toString() {
    return r'entityListProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<List<Map<String, dynamic>>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<Map<String, dynamic>>> create(Ref ref) {
    final argument = this.argument as String;
    return entityList(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is EntityListProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$entityListHash() => r'25a78c17bbe4b201de230ef9ce0bfbebaf04f699';

/// One list per resource path, e.g. `entityListProvider('warehouses')`. Callers invalidate this
/// after create/update/delete to refetch — there's no server-side pagination to page through,
/// every list call already returns the full table (confirmed across all 14 controllers).

final class EntityListFamily extends $Family
    with
        $FunctionalFamilyOverride<
          FutureOr<List<Map<String, dynamic>>>,
          String
        > {
  EntityListFamily._()
    : super(
        retry: null,
        name: r'entityListProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// One list per resource path, e.g. `entityListProvider('warehouses')`. Callers invalidate this
  /// after create/update/delete to refetch — there's no server-side pagination to page through,
  /// every list call already returns the full table (confirmed across all 14 controllers).

  EntityListProvider call(String resourcePath) =>
      EntityListProvider._(argument: resourcePath, from: this);

  @override
  String toString() => r'entityListProvider';
}
