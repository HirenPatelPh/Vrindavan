// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'dashboard_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TodayFigures {

@JsonKey(fromJson: _toDouble) double get amount; int get count;
/// Create a copy of TodayFigures
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TodayFiguresCopyWith<TodayFigures> get copyWith => _$TodayFiguresCopyWithImpl<TodayFigures>(this as TodayFigures, _$identity);

  /// Serializes this TodayFigures to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TodayFigures&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.count, count) || other.count == count));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,amount,count);

@override
String toString() {
  return 'TodayFigures(amount: $amount, count: $count)';
}


}

/// @nodoc
abstract mixin class $TodayFiguresCopyWith<$Res>  {
  factory $TodayFiguresCopyWith(TodayFigures value, $Res Function(TodayFigures) _then) = _$TodayFiguresCopyWithImpl;
@useResult
$Res call({
@JsonKey(fromJson: _toDouble) double amount, int count
});




}
/// @nodoc
class _$TodayFiguresCopyWithImpl<$Res>
    implements $TodayFiguresCopyWith<$Res> {
  _$TodayFiguresCopyWithImpl(this._self, this._then);

  final TodayFigures _self;
  final $Res Function(TodayFigures) _then;

/// Create a copy of TodayFigures
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? amount = null,Object? count = null,}) {
  return _then(_self.copyWith(
amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,count: null == count ? _self.count : count // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [TodayFigures].
extension TodayFiguresPatterns on TodayFigures {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TodayFigures value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TodayFigures() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TodayFigures value)  $default,){
final _that = this;
switch (_that) {
case _TodayFigures():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TodayFigures value)?  $default,){
final _that = this;
switch (_that) {
case _TodayFigures() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(fromJson: _toDouble)  double amount,  int count)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TodayFigures() when $default != null:
return $default(_that.amount,_that.count);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(fromJson: _toDouble)  double amount,  int count)  $default,) {final _that = this;
switch (_that) {
case _TodayFigures():
return $default(_that.amount,_that.count);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(fromJson: _toDouble)  double amount,  int count)?  $default,) {final _that = this;
switch (_that) {
case _TodayFigures() when $default != null:
return $default(_that.amount,_that.count);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TodayFigures implements TodayFigures {
  const _TodayFigures({@JsonKey(fromJson: _toDouble) required this.amount, required this.count});
  factory _TodayFigures.fromJson(Map<String, dynamic> json) => _$TodayFiguresFromJson(json);

@override@JsonKey(fromJson: _toDouble) final  double amount;
@override final  int count;

/// Create a copy of TodayFigures
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TodayFiguresCopyWith<_TodayFigures> get copyWith => __$TodayFiguresCopyWithImpl<_TodayFigures>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TodayFiguresToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TodayFigures&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.count, count) || other.count == count));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,amount,count);

@override
String toString() {
  return 'TodayFigures(amount: $amount, count: $count)';
}


}

/// @nodoc
abstract mixin class _$TodayFiguresCopyWith<$Res> implements $TodayFiguresCopyWith<$Res> {
  factory _$TodayFiguresCopyWith(_TodayFigures value, $Res Function(_TodayFigures) _then) = __$TodayFiguresCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(fromJson: _toDouble) double amount, int count
});




}
/// @nodoc
class __$TodayFiguresCopyWithImpl<$Res>
    implements _$TodayFiguresCopyWith<$Res> {
  __$TodayFiguresCopyWithImpl(this._self, this._then);

  final _TodayFigures _self;
  final $Res Function(_TodayFigures) _then;

/// Create a copy of TodayFigures
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? amount = null,Object? count = null,}) {
  return _then(_TodayFigures(
amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as double,count: null == count ? _self.count : count // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$QuickStats {

 int get activeProducts; int get activeCustomers; int get activeSuppliers; int get activeWarehouses;
/// Create a copy of QuickStats
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuickStatsCopyWith<QuickStats> get copyWith => _$QuickStatsCopyWithImpl<QuickStats>(this as QuickStats, _$identity);

  /// Serializes this QuickStats to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuickStats&&(identical(other.activeProducts, activeProducts) || other.activeProducts == activeProducts)&&(identical(other.activeCustomers, activeCustomers) || other.activeCustomers == activeCustomers)&&(identical(other.activeSuppliers, activeSuppliers) || other.activeSuppliers == activeSuppliers)&&(identical(other.activeWarehouses, activeWarehouses) || other.activeWarehouses == activeWarehouses));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,activeProducts,activeCustomers,activeSuppliers,activeWarehouses);

@override
String toString() {
  return 'QuickStats(activeProducts: $activeProducts, activeCustomers: $activeCustomers, activeSuppliers: $activeSuppliers, activeWarehouses: $activeWarehouses)';
}


}

/// @nodoc
abstract mixin class $QuickStatsCopyWith<$Res>  {
  factory $QuickStatsCopyWith(QuickStats value, $Res Function(QuickStats) _then) = _$QuickStatsCopyWithImpl;
@useResult
$Res call({
 int activeProducts, int activeCustomers, int activeSuppliers, int activeWarehouses
});




}
/// @nodoc
class _$QuickStatsCopyWithImpl<$Res>
    implements $QuickStatsCopyWith<$Res> {
  _$QuickStatsCopyWithImpl(this._self, this._then);

  final QuickStats _self;
  final $Res Function(QuickStats) _then;

/// Create a copy of QuickStats
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? activeProducts = null,Object? activeCustomers = null,Object? activeSuppliers = null,Object? activeWarehouses = null,}) {
  return _then(_self.copyWith(
activeProducts: null == activeProducts ? _self.activeProducts : activeProducts // ignore: cast_nullable_to_non_nullable
as int,activeCustomers: null == activeCustomers ? _self.activeCustomers : activeCustomers // ignore: cast_nullable_to_non_nullable
as int,activeSuppliers: null == activeSuppliers ? _self.activeSuppliers : activeSuppliers // ignore: cast_nullable_to_non_nullable
as int,activeWarehouses: null == activeWarehouses ? _self.activeWarehouses : activeWarehouses // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [QuickStats].
extension QuickStatsPatterns on QuickStats {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _QuickStats value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _QuickStats() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _QuickStats value)  $default,){
final _that = this;
switch (_that) {
case _QuickStats():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _QuickStats value)?  $default,){
final _that = this;
switch (_that) {
case _QuickStats() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int activeProducts,  int activeCustomers,  int activeSuppliers,  int activeWarehouses)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _QuickStats() when $default != null:
return $default(_that.activeProducts,_that.activeCustomers,_that.activeSuppliers,_that.activeWarehouses);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int activeProducts,  int activeCustomers,  int activeSuppliers,  int activeWarehouses)  $default,) {final _that = this;
switch (_that) {
case _QuickStats():
return $default(_that.activeProducts,_that.activeCustomers,_that.activeSuppliers,_that.activeWarehouses);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int activeProducts,  int activeCustomers,  int activeSuppliers,  int activeWarehouses)?  $default,) {final _that = this;
switch (_that) {
case _QuickStats() when $default != null:
return $default(_that.activeProducts,_that.activeCustomers,_that.activeSuppliers,_that.activeWarehouses);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _QuickStats implements QuickStats {
  const _QuickStats({required this.activeProducts, required this.activeCustomers, required this.activeSuppliers, required this.activeWarehouses});
  factory _QuickStats.fromJson(Map<String, dynamic> json) => _$QuickStatsFromJson(json);

@override final  int activeProducts;
@override final  int activeCustomers;
@override final  int activeSuppliers;
@override final  int activeWarehouses;

/// Create a copy of QuickStats
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuickStatsCopyWith<_QuickStats> get copyWith => __$QuickStatsCopyWithImpl<_QuickStats>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$QuickStatsToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _QuickStats&&(identical(other.activeProducts, activeProducts) || other.activeProducts == activeProducts)&&(identical(other.activeCustomers, activeCustomers) || other.activeCustomers == activeCustomers)&&(identical(other.activeSuppliers, activeSuppliers) || other.activeSuppliers == activeSuppliers)&&(identical(other.activeWarehouses, activeWarehouses) || other.activeWarehouses == activeWarehouses));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,activeProducts,activeCustomers,activeSuppliers,activeWarehouses);

@override
String toString() {
  return 'QuickStats(activeProducts: $activeProducts, activeCustomers: $activeCustomers, activeSuppliers: $activeSuppliers, activeWarehouses: $activeWarehouses)';
}


}

/// @nodoc
abstract mixin class _$QuickStatsCopyWith<$Res> implements $QuickStatsCopyWith<$Res> {
  factory _$QuickStatsCopyWith(_QuickStats value, $Res Function(_QuickStats) _then) = __$QuickStatsCopyWithImpl;
@override @useResult
$Res call({
 int activeProducts, int activeCustomers, int activeSuppliers, int activeWarehouses
});




}
/// @nodoc
class __$QuickStatsCopyWithImpl<$Res>
    implements _$QuickStatsCopyWith<$Res> {
  __$QuickStatsCopyWithImpl(this._self, this._then);

  final _QuickStats _self;
  final $Res Function(_QuickStats) _then;

/// Create a copy of QuickStats
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? activeProducts = null,Object? activeCustomers = null,Object? activeSuppliers = null,Object? activeWarehouses = null,}) {
  return _then(_QuickStats(
activeProducts: null == activeProducts ? _self.activeProducts : activeProducts // ignore: cast_nullable_to_non_nullable
as int,activeCustomers: null == activeCustomers ? _self.activeCustomers : activeCustomers // ignore: cast_nullable_to_non_nullable
as int,activeSuppliers: null == activeSuppliers ? _self.activeSuppliers : activeSuppliers // ignore: cast_nullable_to_non_nullable
as int,activeWarehouses: null == activeWarehouses ? _self.activeWarehouses : activeWarehouses // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$DashboardSummary {

 TodayFigures get todaySales; TodayFigures get todayPurchase; int get todayDispatchCount; int get todayInwardCount;@JsonKey(fromJson: _toDouble) double get stockValue; int get pendingPurchaseOrders; int get pendingSalesOrders; QuickStats get quickStats;
/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DashboardSummaryCopyWith<DashboardSummary> get copyWith => _$DashboardSummaryCopyWithImpl<DashboardSummary>(this as DashboardSummary, _$identity);

  /// Serializes this DashboardSummary to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DashboardSummary&&(identical(other.todaySales, todaySales) || other.todaySales == todaySales)&&(identical(other.todayPurchase, todayPurchase) || other.todayPurchase == todayPurchase)&&(identical(other.todayDispatchCount, todayDispatchCount) || other.todayDispatchCount == todayDispatchCount)&&(identical(other.todayInwardCount, todayInwardCount) || other.todayInwardCount == todayInwardCount)&&(identical(other.stockValue, stockValue) || other.stockValue == stockValue)&&(identical(other.pendingPurchaseOrders, pendingPurchaseOrders) || other.pendingPurchaseOrders == pendingPurchaseOrders)&&(identical(other.pendingSalesOrders, pendingSalesOrders) || other.pendingSalesOrders == pendingSalesOrders)&&(identical(other.quickStats, quickStats) || other.quickStats == quickStats));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,todaySales,todayPurchase,todayDispatchCount,todayInwardCount,stockValue,pendingPurchaseOrders,pendingSalesOrders,quickStats);

@override
String toString() {
  return 'DashboardSummary(todaySales: $todaySales, todayPurchase: $todayPurchase, todayDispatchCount: $todayDispatchCount, todayInwardCount: $todayInwardCount, stockValue: $stockValue, pendingPurchaseOrders: $pendingPurchaseOrders, pendingSalesOrders: $pendingSalesOrders, quickStats: $quickStats)';
}


}

/// @nodoc
abstract mixin class $DashboardSummaryCopyWith<$Res>  {
  factory $DashboardSummaryCopyWith(DashboardSummary value, $Res Function(DashboardSummary) _then) = _$DashboardSummaryCopyWithImpl;
@useResult
$Res call({
 TodayFigures todaySales, TodayFigures todayPurchase, int todayDispatchCount, int todayInwardCount,@JsonKey(fromJson: _toDouble) double stockValue, int pendingPurchaseOrders, int pendingSalesOrders, QuickStats quickStats
});


$TodayFiguresCopyWith<$Res> get todaySales;$TodayFiguresCopyWith<$Res> get todayPurchase;$QuickStatsCopyWith<$Res> get quickStats;

}
/// @nodoc
class _$DashboardSummaryCopyWithImpl<$Res>
    implements $DashboardSummaryCopyWith<$Res> {
  _$DashboardSummaryCopyWithImpl(this._self, this._then);

  final DashboardSummary _self;
  final $Res Function(DashboardSummary) _then;

/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? todaySales = null,Object? todayPurchase = null,Object? todayDispatchCount = null,Object? todayInwardCount = null,Object? stockValue = null,Object? pendingPurchaseOrders = null,Object? pendingSalesOrders = null,Object? quickStats = null,}) {
  return _then(_self.copyWith(
todaySales: null == todaySales ? _self.todaySales : todaySales // ignore: cast_nullable_to_non_nullable
as TodayFigures,todayPurchase: null == todayPurchase ? _self.todayPurchase : todayPurchase // ignore: cast_nullable_to_non_nullable
as TodayFigures,todayDispatchCount: null == todayDispatchCount ? _self.todayDispatchCount : todayDispatchCount // ignore: cast_nullable_to_non_nullable
as int,todayInwardCount: null == todayInwardCount ? _self.todayInwardCount : todayInwardCount // ignore: cast_nullable_to_non_nullable
as int,stockValue: null == stockValue ? _self.stockValue : stockValue // ignore: cast_nullable_to_non_nullable
as double,pendingPurchaseOrders: null == pendingPurchaseOrders ? _self.pendingPurchaseOrders : pendingPurchaseOrders // ignore: cast_nullable_to_non_nullable
as int,pendingSalesOrders: null == pendingSalesOrders ? _self.pendingSalesOrders : pendingSalesOrders // ignore: cast_nullable_to_non_nullable
as int,quickStats: null == quickStats ? _self.quickStats : quickStats // ignore: cast_nullable_to_non_nullable
as QuickStats,
  ));
}
/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TodayFiguresCopyWith<$Res> get todaySales {
  
  return $TodayFiguresCopyWith<$Res>(_self.todaySales, (value) {
    return _then(_self.copyWith(todaySales: value));
  });
}/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TodayFiguresCopyWith<$Res> get todayPurchase {
  
  return $TodayFiguresCopyWith<$Res>(_self.todayPurchase, (value) {
    return _then(_self.copyWith(todayPurchase: value));
  });
}/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$QuickStatsCopyWith<$Res> get quickStats {
  
  return $QuickStatsCopyWith<$Res>(_self.quickStats, (value) {
    return _then(_self.copyWith(quickStats: value));
  });
}
}


/// Adds pattern-matching-related methods to [DashboardSummary].
extension DashboardSummaryPatterns on DashboardSummary {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DashboardSummary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DashboardSummary() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DashboardSummary value)  $default,){
final _that = this;
switch (_that) {
case _DashboardSummary():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DashboardSummary value)?  $default,){
final _that = this;
switch (_that) {
case _DashboardSummary() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( TodayFigures todaySales,  TodayFigures todayPurchase,  int todayDispatchCount,  int todayInwardCount, @JsonKey(fromJson: _toDouble)  double stockValue,  int pendingPurchaseOrders,  int pendingSalesOrders,  QuickStats quickStats)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DashboardSummary() when $default != null:
return $default(_that.todaySales,_that.todayPurchase,_that.todayDispatchCount,_that.todayInwardCount,_that.stockValue,_that.pendingPurchaseOrders,_that.pendingSalesOrders,_that.quickStats);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( TodayFigures todaySales,  TodayFigures todayPurchase,  int todayDispatchCount,  int todayInwardCount, @JsonKey(fromJson: _toDouble)  double stockValue,  int pendingPurchaseOrders,  int pendingSalesOrders,  QuickStats quickStats)  $default,) {final _that = this;
switch (_that) {
case _DashboardSummary():
return $default(_that.todaySales,_that.todayPurchase,_that.todayDispatchCount,_that.todayInwardCount,_that.stockValue,_that.pendingPurchaseOrders,_that.pendingSalesOrders,_that.quickStats);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( TodayFigures todaySales,  TodayFigures todayPurchase,  int todayDispatchCount,  int todayInwardCount, @JsonKey(fromJson: _toDouble)  double stockValue,  int pendingPurchaseOrders,  int pendingSalesOrders,  QuickStats quickStats)?  $default,) {final _that = this;
switch (_that) {
case _DashboardSummary() when $default != null:
return $default(_that.todaySales,_that.todayPurchase,_that.todayDispatchCount,_that.todayInwardCount,_that.stockValue,_that.pendingPurchaseOrders,_that.pendingSalesOrders,_that.quickStats);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _DashboardSummary implements DashboardSummary {
  const _DashboardSummary({required this.todaySales, required this.todayPurchase, required this.todayDispatchCount, required this.todayInwardCount, @JsonKey(fromJson: _toDouble) required this.stockValue, required this.pendingPurchaseOrders, required this.pendingSalesOrders, required this.quickStats});
  factory _DashboardSummary.fromJson(Map<String, dynamic> json) => _$DashboardSummaryFromJson(json);

@override final  TodayFigures todaySales;
@override final  TodayFigures todayPurchase;
@override final  int todayDispatchCount;
@override final  int todayInwardCount;
@override@JsonKey(fromJson: _toDouble) final  double stockValue;
@override final  int pendingPurchaseOrders;
@override final  int pendingSalesOrders;
@override final  QuickStats quickStats;

/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DashboardSummaryCopyWith<_DashboardSummary> get copyWith => __$DashboardSummaryCopyWithImpl<_DashboardSummary>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DashboardSummaryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DashboardSummary&&(identical(other.todaySales, todaySales) || other.todaySales == todaySales)&&(identical(other.todayPurchase, todayPurchase) || other.todayPurchase == todayPurchase)&&(identical(other.todayDispatchCount, todayDispatchCount) || other.todayDispatchCount == todayDispatchCount)&&(identical(other.todayInwardCount, todayInwardCount) || other.todayInwardCount == todayInwardCount)&&(identical(other.stockValue, stockValue) || other.stockValue == stockValue)&&(identical(other.pendingPurchaseOrders, pendingPurchaseOrders) || other.pendingPurchaseOrders == pendingPurchaseOrders)&&(identical(other.pendingSalesOrders, pendingSalesOrders) || other.pendingSalesOrders == pendingSalesOrders)&&(identical(other.quickStats, quickStats) || other.quickStats == quickStats));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,todaySales,todayPurchase,todayDispatchCount,todayInwardCount,stockValue,pendingPurchaseOrders,pendingSalesOrders,quickStats);

@override
String toString() {
  return 'DashboardSummary(todaySales: $todaySales, todayPurchase: $todayPurchase, todayDispatchCount: $todayDispatchCount, todayInwardCount: $todayInwardCount, stockValue: $stockValue, pendingPurchaseOrders: $pendingPurchaseOrders, pendingSalesOrders: $pendingSalesOrders, quickStats: $quickStats)';
}


}

/// @nodoc
abstract mixin class _$DashboardSummaryCopyWith<$Res> implements $DashboardSummaryCopyWith<$Res> {
  factory _$DashboardSummaryCopyWith(_DashboardSummary value, $Res Function(_DashboardSummary) _then) = __$DashboardSummaryCopyWithImpl;
@override @useResult
$Res call({
 TodayFigures todaySales, TodayFigures todayPurchase, int todayDispatchCount, int todayInwardCount,@JsonKey(fromJson: _toDouble) double stockValue, int pendingPurchaseOrders, int pendingSalesOrders, QuickStats quickStats
});


@override $TodayFiguresCopyWith<$Res> get todaySales;@override $TodayFiguresCopyWith<$Res> get todayPurchase;@override $QuickStatsCopyWith<$Res> get quickStats;

}
/// @nodoc
class __$DashboardSummaryCopyWithImpl<$Res>
    implements _$DashboardSummaryCopyWith<$Res> {
  __$DashboardSummaryCopyWithImpl(this._self, this._then);

  final _DashboardSummary _self;
  final $Res Function(_DashboardSummary) _then;

/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? todaySales = null,Object? todayPurchase = null,Object? todayDispatchCount = null,Object? todayInwardCount = null,Object? stockValue = null,Object? pendingPurchaseOrders = null,Object? pendingSalesOrders = null,Object? quickStats = null,}) {
  return _then(_DashboardSummary(
todaySales: null == todaySales ? _self.todaySales : todaySales // ignore: cast_nullable_to_non_nullable
as TodayFigures,todayPurchase: null == todayPurchase ? _self.todayPurchase : todayPurchase // ignore: cast_nullable_to_non_nullable
as TodayFigures,todayDispatchCount: null == todayDispatchCount ? _self.todayDispatchCount : todayDispatchCount // ignore: cast_nullable_to_non_nullable
as int,todayInwardCount: null == todayInwardCount ? _self.todayInwardCount : todayInwardCount // ignore: cast_nullable_to_non_nullable
as int,stockValue: null == stockValue ? _self.stockValue : stockValue // ignore: cast_nullable_to_non_nullable
as double,pendingPurchaseOrders: null == pendingPurchaseOrders ? _self.pendingPurchaseOrders : pendingPurchaseOrders // ignore: cast_nullable_to_non_nullable
as int,pendingSalesOrders: null == pendingSalesOrders ? _self.pendingSalesOrders : pendingSalesOrders // ignore: cast_nullable_to_non_nullable
as int,quickStats: null == quickStats ? _self.quickStats : quickStats // ignore: cast_nullable_to_non_nullable
as QuickStats,
  ));
}

/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TodayFiguresCopyWith<$Res> get todaySales {
  
  return $TodayFiguresCopyWith<$Res>(_self.todaySales, (value) {
    return _then(_self.copyWith(todaySales: value));
  });
}/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TodayFiguresCopyWith<$Res> get todayPurchase {
  
  return $TodayFiguresCopyWith<$Res>(_self.todayPurchase, (value) {
    return _then(_self.copyWith(todayPurchase: value));
  });
}/// Create a copy of DashboardSummary
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$QuickStatsCopyWith<$Res> get quickStats {
  
  return $QuickStatsCopyWith<$Res>(_self.quickStats, (value) {
    return _then(_self.copyWith(quickStats: value));
  });
}
}


/// @nodoc
mixin _$LowStockItem {

 String get productId; String get productName; String get sku;@JsonKey(fromJson: _toDouble) double get reorderLevel;@JsonKey(fromJson: _toDouble) double get minimumStock;@JsonKey(fromJson: _toDouble) double get totalQuantity;@JsonKey(fromJson: _toDouble) double get totalAvailable;
/// Create a copy of LowStockItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LowStockItemCopyWith<LowStockItem> get copyWith => _$LowStockItemCopyWithImpl<LowStockItem>(this as LowStockItem, _$identity);

  /// Serializes this LowStockItem to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LowStockItem&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.reorderLevel, reorderLevel) || other.reorderLevel == reorderLevel)&&(identical(other.minimumStock, minimumStock) || other.minimumStock == minimumStock)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity)&&(identical(other.totalAvailable, totalAvailable) || other.totalAvailable == totalAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,sku,reorderLevel,minimumStock,totalQuantity,totalAvailable);

@override
String toString() {
  return 'LowStockItem(productId: $productId, productName: $productName, sku: $sku, reorderLevel: $reorderLevel, minimumStock: $minimumStock, totalQuantity: $totalQuantity, totalAvailable: $totalAvailable)';
}


}

/// @nodoc
abstract mixin class $LowStockItemCopyWith<$Res>  {
  factory $LowStockItemCopyWith(LowStockItem value, $Res Function(LowStockItem) _then) = _$LowStockItemCopyWithImpl;
@useResult
$Res call({
 String productId, String productName, String sku,@JsonKey(fromJson: _toDouble) double reorderLevel,@JsonKey(fromJson: _toDouble) double minimumStock,@JsonKey(fromJson: _toDouble) double totalQuantity,@JsonKey(fromJson: _toDouble) double totalAvailable
});




}
/// @nodoc
class _$LowStockItemCopyWithImpl<$Res>
    implements $LowStockItemCopyWith<$Res> {
  _$LowStockItemCopyWithImpl(this._self, this._then);

  final LowStockItem _self;
  final $Res Function(LowStockItem) _then;

/// Create a copy of LowStockItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? productId = null,Object? productName = null,Object? sku = null,Object? reorderLevel = null,Object? minimumStock = null,Object? totalQuantity = null,Object? totalAvailable = null,}) {
  return _then(_self.copyWith(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,reorderLevel: null == reorderLevel ? _self.reorderLevel : reorderLevel // ignore: cast_nullable_to_non_nullable
as double,minimumStock: null == minimumStock ? _self.minimumStock : minimumStock // ignore: cast_nullable_to_non_nullable
as double,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,totalAvailable: null == totalAvailable ? _self.totalAvailable : totalAvailable // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [LowStockItem].
extension LowStockItemPatterns on LowStockItem {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LowStockItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LowStockItem() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LowStockItem value)  $default,){
final _that = this;
switch (_that) {
case _LowStockItem():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LowStockItem value)?  $default,){
final _that = this;
switch (_that) {
case _LowStockItem() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double reorderLevel, @JsonKey(fromJson: _toDouble)  double minimumStock, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double totalAvailable)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LowStockItem() when $default != null:
return $default(_that.productId,_that.productName,_that.sku,_that.reorderLevel,_that.minimumStock,_that.totalQuantity,_that.totalAvailable);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double reorderLevel, @JsonKey(fromJson: _toDouble)  double minimumStock, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double totalAvailable)  $default,) {final _that = this;
switch (_that) {
case _LowStockItem():
return $default(_that.productId,_that.productName,_that.sku,_that.reorderLevel,_that.minimumStock,_that.totalQuantity,_that.totalAvailable);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double reorderLevel, @JsonKey(fromJson: _toDouble)  double minimumStock, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double totalAvailable)?  $default,) {final _that = this;
switch (_that) {
case _LowStockItem() when $default != null:
return $default(_that.productId,_that.productName,_that.sku,_that.reorderLevel,_that.minimumStock,_that.totalQuantity,_that.totalAvailable);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LowStockItem implements LowStockItem {
  const _LowStockItem({required this.productId, required this.productName, required this.sku, @JsonKey(fromJson: _toDouble) required this.reorderLevel, @JsonKey(fromJson: _toDouble) required this.minimumStock, @JsonKey(fromJson: _toDouble) required this.totalQuantity, @JsonKey(fromJson: _toDouble) required this.totalAvailable});
  factory _LowStockItem.fromJson(Map<String, dynamic> json) => _$LowStockItemFromJson(json);

@override final  String productId;
@override final  String productName;
@override final  String sku;
@override@JsonKey(fromJson: _toDouble) final  double reorderLevel;
@override@JsonKey(fromJson: _toDouble) final  double minimumStock;
@override@JsonKey(fromJson: _toDouble) final  double totalQuantity;
@override@JsonKey(fromJson: _toDouble) final  double totalAvailable;

/// Create a copy of LowStockItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LowStockItemCopyWith<_LowStockItem> get copyWith => __$LowStockItemCopyWithImpl<_LowStockItem>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LowStockItemToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LowStockItem&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.reorderLevel, reorderLevel) || other.reorderLevel == reorderLevel)&&(identical(other.minimumStock, minimumStock) || other.minimumStock == minimumStock)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity)&&(identical(other.totalAvailable, totalAvailable) || other.totalAvailable == totalAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,sku,reorderLevel,minimumStock,totalQuantity,totalAvailable);

@override
String toString() {
  return 'LowStockItem(productId: $productId, productName: $productName, sku: $sku, reorderLevel: $reorderLevel, minimumStock: $minimumStock, totalQuantity: $totalQuantity, totalAvailable: $totalAvailable)';
}


}

/// @nodoc
abstract mixin class _$LowStockItemCopyWith<$Res> implements $LowStockItemCopyWith<$Res> {
  factory _$LowStockItemCopyWith(_LowStockItem value, $Res Function(_LowStockItem) _then) = __$LowStockItemCopyWithImpl;
@override @useResult
$Res call({
 String productId, String productName, String sku,@JsonKey(fromJson: _toDouble) double reorderLevel,@JsonKey(fromJson: _toDouble) double minimumStock,@JsonKey(fromJson: _toDouble) double totalQuantity,@JsonKey(fromJson: _toDouble) double totalAvailable
});




}
/// @nodoc
class __$LowStockItemCopyWithImpl<$Res>
    implements _$LowStockItemCopyWith<$Res> {
  __$LowStockItemCopyWithImpl(this._self, this._then);

  final _LowStockItem _self;
  final $Res Function(_LowStockItem) _then;

/// Create a copy of LowStockItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? productId = null,Object? productName = null,Object? sku = null,Object? reorderLevel = null,Object? minimumStock = null,Object? totalQuantity = null,Object? totalAvailable = null,}) {
  return _then(_LowStockItem(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,reorderLevel: null == reorderLevel ? _self.reorderLevel : reorderLevel // ignore: cast_nullable_to_non_nullable
as double,minimumStock: null == minimumStock ? _self.minimumStock : minimumStock // ignore: cast_nullable_to_non_nullable
as double,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,totalAvailable: null == totalAvailable ? _self.totalAvailable : totalAvailable // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}


/// @nodoc
mixin _$DeadStockItem {

 String get productId; String get productName; String get sku;@JsonKey(fromJson: _toDouble) double get totalQuantity;@JsonKey(fromJson: _toDouble) double get stockValue; DateTime? get lastSaleDate;
/// Create a copy of DeadStockItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DeadStockItemCopyWith<DeadStockItem> get copyWith => _$DeadStockItemCopyWithImpl<DeadStockItem>(this as DeadStockItem, _$identity);

  /// Serializes this DeadStockItem to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DeadStockItem&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity)&&(identical(other.stockValue, stockValue) || other.stockValue == stockValue)&&(identical(other.lastSaleDate, lastSaleDate) || other.lastSaleDate == lastSaleDate));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,sku,totalQuantity,stockValue,lastSaleDate);

@override
String toString() {
  return 'DeadStockItem(productId: $productId, productName: $productName, sku: $sku, totalQuantity: $totalQuantity, stockValue: $stockValue, lastSaleDate: $lastSaleDate)';
}


}

/// @nodoc
abstract mixin class $DeadStockItemCopyWith<$Res>  {
  factory $DeadStockItemCopyWith(DeadStockItem value, $Res Function(DeadStockItem) _then) = _$DeadStockItemCopyWithImpl;
@useResult
$Res call({
 String productId, String productName, String sku,@JsonKey(fromJson: _toDouble) double totalQuantity,@JsonKey(fromJson: _toDouble) double stockValue, DateTime? lastSaleDate
});




}
/// @nodoc
class _$DeadStockItemCopyWithImpl<$Res>
    implements $DeadStockItemCopyWith<$Res> {
  _$DeadStockItemCopyWithImpl(this._self, this._then);

  final DeadStockItem _self;
  final $Res Function(DeadStockItem) _then;

/// Create a copy of DeadStockItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? productId = null,Object? productName = null,Object? sku = null,Object? totalQuantity = null,Object? stockValue = null,Object? lastSaleDate = freezed,}) {
  return _then(_self.copyWith(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,stockValue: null == stockValue ? _self.stockValue : stockValue // ignore: cast_nullable_to_non_nullable
as double,lastSaleDate: freezed == lastSaleDate ? _self.lastSaleDate : lastSaleDate // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [DeadStockItem].
extension DeadStockItemPatterns on DeadStockItem {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DeadStockItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DeadStockItem() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DeadStockItem value)  $default,){
final _that = this;
switch (_that) {
case _DeadStockItem():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DeadStockItem value)?  $default,){
final _that = this;
switch (_that) {
case _DeadStockItem() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double stockValue,  DateTime? lastSaleDate)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DeadStockItem() when $default != null:
return $default(_that.productId,_that.productName,_that.sku,_that.totalQuantity,_that.stockValue,_that.lastSaleDate);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double stockValue,  DateTime? lastSaleDate)  $default,) {final _that = this;
switch (_that) {
case _DeadStockItem():
return $default(_that.productId,_that.productName,_that.sku,_that.totalQuantity,_that.stockValue,_that.lastSaleDate);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double stockValue,  DateTime? lastSaleDate)?  $default,) {final _that = this;
switch (_that) {
case _DeadStockItem() when $default != null:
return $default(_that.productId,_that.productName,_that.sku,_that.totalQuantity,_that.stockValue,_that.lastSaleDate);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _DeadStockItem implements DeadStockItem {
  const _DeadStockItem({required this.productId, required this.productName, required this.sku, @JsonKey(fromJson: _toDouble) required this.totalQuantity, @JsonKey(fromJson: _toDouble) required this.stockValue, this.lastSaleDate});
  factory _DeadStockItem.fromJson(Map<String, dynamic> json) => _$DeadStockItemFromJson(json);

@override final  String productId;
@override final  String productName;
@override final  String sku;
@override@JsonKey(fromJson: _toDouble) final  double totalQuantity;
@override@JsonKey(fromJson: _toDouble) final  double stockValue;
@override final  DateTime? lastSaleDate;

/// Create a copy of DeadStockItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DeadStockItemCopyWith<_DeadStockItem> get copyWith => __$DeadStockItemCopyWithImpl<_DeadStockItem>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DeadStockItemToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DeadStockItem&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity)&&(identical(other.stockValue, stockValue) || other.stockValue == stockValue)&&(identical(other.lastSaleDate, lastSaleDate) || other.lastSaleDate == lastSaleDate));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,sku,totalQuantity,stockValue,lastSaleDate);

@override
String toString() {
  return 'DeadStockItem(productId: $productId, productName: $productName, sku: $sku, totalQuantity: $totalQuantity, stockValue: $stockValue, lastSaleDate: $lastSaleDate)';
}


}

/// @nodoc
abstract mixin class _$DeadStockItemCopyWith<$Res> implements $DeadStockItemCopyWith<$Res> {
  factory _$DeadStockItemCopyWith(_DeadStockItem value, $Res Function(_DeadStockItem) _then) = __$DeadStockItemCopyWithImpl;
@override @useResult
$Res call({
 String productId, String productName, String sku,@JsonKey(fromJson: _toDouble) double totalQuantity,@JsonKey(fromJson: _toDouble) double stockValue, DateTime? lastSaleDate
});




}
/// @nodoc
class __$DeadStockItemCopyWithImpl<$Res>
    implements _$DeadStockItemCopyWith<$Res> {
  __$DeadStockItemCopyWithImpl(this._self, this._then);

  final _DeadStockItem _self;
  final $Res Function(_DeadStockItem) _then;

/// Create a copy of DeadStockItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? productId = null,Object? productName = null,Object? sku = null,Object? totalQuantity = null,Object? stockValue = null,Object? lastSaleDate = freezed,}) {
  return _then(_DeadStockItem(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,stockValue: null == stockValue ? _self.stockValue : stockValue // ignore: cast_nullable_to_non_nullable
as double,lastSaleDate: freezed == lastSaleDate ? _self.lastSaleDate : lastSaleDate // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}


/// @nodoc
mixin _$TopSellingItem {

 String get productId; String get productName; String get sku;@JsonKey(fromJson: _toDouble) double get totalQuantitySold;@JsonKey(fromJson: _toDouble) double get totalSalesAmount;
/// Create a copy of TopSellingItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TopSellingItemCopyWith<TopSellingItem> get copyWith => _$TopSellingItemCopyWithImpl<TopSellingItem>(this as TopSellingItem, _$identity);

  /// Serializes this TopSellingItem to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TopSellingItem&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.totalQuantitySold, totalQuantitySold) || other.totalQuantitySold == totalQuantitySold)&&(identical(other.totalSalesAmount, totalSalesAmount) || other.totalSalesAmount == totalSalesAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,sku,totalQuantitySold,totalSalesAmount);

@override
String toString() {
  return 'TopSellingItem(productId: $productId, productName: $productName, sku: $sku, totalQuantitySold: $totalQuantitySold, totalSalesAmount: $totalSalesAmount)';
}


}

/// @nodoc
abstract mixin class $TopSellingItemCopyWith<$Res>  {
  factory $TopSellingItemCopyWith(TopSellingItem value, $Res Function(TopSellingItem) _then) = _$TopSellingItemCopyWithImpl;
@useResult
$Res call({
 String productId, String productName, String sku,@JsonKey(fromJson: _toDouble) double totalQuantitySold,@JsonKey(fromJson: _toDouble) double totalSalesAmount
});




}
/// @nodoc
class _$TopSellingItemCopyWithImpl<$Res>
    implements $TopSellingItemCopyWith<$Res> {
  _$TopSellingItemCopyWithImpl(this._self, this._then);

  final TopSellingItem _self;
  final $Res Function(TopSellingItem) _then;

/// Create a copy of TopSellingItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? productId = null,Object? productName = null,Object? sku = null,Object? totalQuantitySold = null,Object? totalSalesAmount = null,}) {
  return _then(_self.copyWith(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,totalQuantitySold: null == totalQuantitySold ? _self.totalQuantitySold : totalQuantitySold // ignore: cast_nullable_to_non_nullable
as double,totalSalesAmount: null == totalSalesAmount ? _self.totalSalesAmount : totalSalesAmount // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [TopSellingItem].
extension TopSellingItemPatterns on TopSellingItem {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TopSellingItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TopSellingItem() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TopSellingItem value)  $default,){
final _that = this;
switch (_that) {
case _TopSellingItem():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TopSellingItem value)?  $default,){
final _that = this;
switch (_that) {
case _TopSellingItem() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double totalQuantitySold, @JsonKey(fromJson: _toDouble)  double totalSalesAmount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TopSellingItem() when $default != null:
return $default(_that.productId,_that.productName,_that.sku,_that.totalQuantitySold,_that.totalSalesAmount);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double totalQuantitySold, @JsonKey(fromJson: _toDouble)  double totalSalesAmount)  $default,) {final _that = this;
switch (_that) {
case _TopSellingItem():
return $default(_that.productId,_that.productName,_that.sku,_that.totalQuantitySold,_that.totalSalesAmount);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String productId,  String productName,  String sku, @JsonKey(fromJson: _toDouble)  double totalQuantitySold, @JsonKey(fromJson: _toDouble)  double totalSalesAmount)?  $default,) {final _that = this;
switch (_that) {
case _TopSellingItem() when $default != null:
return $default(_that.productId,_that.productName,_that.sku,_that.totalQuantitySold,_that.totalSalesAmount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TopSellingItem implements TopSellingItem {
  const _TopSellingItem({required this.productId, required this.productName, required this.sku, @JsonKey(fromJson: _toDouble) required this.totalQuantitySold, @JsonKey(fromJson: _toDouble) required this.totalSalesAmount});
  factory _TopSellingItem.fromJson(Map<String, dynamic> json) => _$TopSellingItemFromJson(json);

@override final  String productId;
@override final  String productName;
@override final  String sku;
@override@JsonKey(fromJson: _toDouble) final  double totalQuantitySold;
@override@JsonKey(fromJson: _toDouble) final  double totalSalesAmount;

/// Create a copy of TopSellingItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TopSellingItemCopyWith<_TopSellingItem> get copyWith => __$TopSellingItemCopyWithImpl<_TopSellingItem>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TopSellingItemToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TopSellingItem&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.totalQuantitySold, totalQuantitySold) || other.totalQuantitySold == totalQuantitySold)&&(identical(other.totalSalesAmount, totalSalesAmount) || other.totalSalesAmount == totalSalesAmount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,sku,totalQuantitySold,totalSalesAmount);

@override
String toString() {
  return 'TopSellingItem(productId: $productId, productName: $productName, sku: $sku, totalQuantitySold: $totalQuantitySold, totalSalesAmount: $totalSalesAmount)';
}


}

/// @nodoc
abstract mixin class _$TopSellingItemCopyWith<$Res> implements $TopSellingItemCopyWith<$Res> {
  factory _$TopSellingItemCopyWith(_TopSellingItem value, $Res Function(_TopSellingItem) _then) = __$TopSellingItemCopyWithImpl;
@override @useResult
$Res call({
 String productId, String productName, String sku,@JsonKey(fromJson: _toDouble) double totalQuantitySold,@JsonKey(fromJson: _toDouble) double totalSalesAmount
});




}
/// @nodoc
class __$TopSellingItemCopyWithImpl<$Res>
    implements _$TopSellingItemCopyWith<$Res> {
  __$TopSellingItemCopyWithImpl(this._self, this._then);

  final _TopSellingItem _self;
  final $Res Function(_TopSellingItem) _then;

/// Create a copy of TopSellingItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? productId = null,Object? productName = null,Object? sku = null,Object? totalQuantitySold = null,Object? totalSalesAmount = null,}) {
  return _then(_TopSellingItem(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,totalQuantitySold: null == totalQuantitySold ? _self.totalQuantitySold : totalQuantitySold // ignore: cast_nullable_to_non_nullable
as double,totalSalesAmount: null == totalSalesAmount ? _self.totalSalesAmount : totalSalesAmount // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}


/// @nodoc
mixin _$MonthlyGraphPoint {

 String get month;@JsonKey(fromJson: _toDouble) double get totalAmount; int get count;
/// Create a copy of MonthlyGraphPoint
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MonthlyGraphPointCopyWith<MonthlyGraphPoint> get copyWith => _$MonthlyGraphPointCopyWithImpl<MonthlyGraphPoint>(this as MonthlyGraphPoint, _$identity);

  /// Serializes this MonthlyGraphPoint to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MonthlyGraphPoint&&(identical(other.month, month) || other.month == month)&&(identical(other.totalAmount, totalAmount) || other.totalAmount == totalAmount)&&(identical(other.count, count) || other.count == count));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,month,totalAmount,count);

@override
String toString() {
  return 'MonthlyGraphPoint(month: $month, totalAmount: $totalAmount, count: $count)';
}


}

/// @nodoc
abstract mixin class $MonthlyGraphPointCopyWith<$Res>  {
  factory $MonthlyGraphPointCopyWith(MonthlyGraphPoint value, $Res Function(MonthlyGraphPoint) _then) = _$MonthlyGraphPointCopyWithImpl;
@useResult
$Res call({
 String month,@JsonKey(fromJson: _toDouble) double totalAmount, int count
});




}
/// @nodoc
class _$MonthlyGraphPointCopyWithImpl<$Res>
    implements $MonthlyGraphPointCopyWith<$Res> {
  _$MonthlyGraphPointCopyWithImpl(this._self, this._then);

  final MonthlyGraphPoint _self;
  final $Res Function(MonthlyGraphPoint) _then;

/// Create a copy of MonthlyGraphPoint
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? month = null,Object? totalAmount = null,Object? count = null,}) {
  return _then(_self.copyWith(
month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as String,totalAmount: null == totalAmount ? _self.totalAmount : totalAmount // ignore: cast_nullable_to_non_nullable
as double,count: null == count ? _self.count : count // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [MonthlyGraphPoint].
extension MonthlyGraphPointPatterns on MonthlyGraphPoint {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MonthlyGraphPoint value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MonthlyGraphPoint() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MonthlyGraphPoint value)  $default,){
final _that = this;
switch (_that) {
case _MonthlyGraphPoint():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MonthlyGraphPoint value)?  $default,){
final _that = this;
switch (_that) {
case _MonthlyGraphPoint() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String month, @JsonKey(fromJson: _toDouble)  double totalAmount,  int count)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MonthlyGraphPoint() when $default != null:
return $default(_that.month,_that.totalAmount,_that.count);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String month, @JsonKey(fromJson: _toDouble)  double totalAmount,  int count)  $default,) {final _that = this;
switch (_that) {
case _MonthlyGraphPoint():
return $default(_that.month,_that.totalAmount,_that.count);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String month, @JsonKey(fromJson: _toDouble)  double totalAmount,  int count)?  $default,) {final _that = this;
switch (_that) {
case _MonthlyGraphPoint() when $default != null:
return $default(_that.month,_that.totalAmount,_that.count);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MonthlyGraphPoint implements MonthlyGraphPoint {
  const _MonthlyGraphPoint({required this.month, @JsonKey(fromJson: _toDouble) required this.totalAmount, required this.count});
  factory _MonthlyGraphPoint.fromJson(Map<String, dynamic> json) => _$MonthlyGraphPointFromJson(json);

@override final  String month;
@override@JsonKey(fromJson: _toDouble) final  double totalAmount;
@override final  int count;

/// Create a copy of MonthlyGraphPoint
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MonthlyGraphPointCopyWith<_MonthlyGraphPoint> get copyWith => __$MonthlyGraphPointCopyWithImpl<_MonthlyGraphPoint>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MonthlyGraphPointToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MonthlyGraphPoint&&(identical(other.month, month) || other.month == month)&&(identical(other.totalAmount, totalAmount) || other.totalAmount == totalAmount)&&(identical(other.count, count) || other.count == count));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,month,totalAmount,count);

@override
String toString() {
  return 'MonthlyGraphPoint(month: $month, totalAmount: $totalAmount, count: $count)';
}


}

/// @nodoc
abstract mixin class _$MonthlyGraphPointCopyWith<$Res> implements $MonthlyGraphPointCopyWith<$Res> {
  factory _$MonthlyGraphPointCopyWith(_MonthlyGraphPoint value, $Res Function(_MonthlyGraphPoint) _then) = __$MonthlyGraphPointCopyWithImpl;
@override @useResult
$Res call({
 String month,@JsonKey(fromJson: _toDouble) double totalAmount, int count
});




}
/// @nodoc
class __$MonthlyGraphPointCopyWithImpl<$Res>
    implements _$MonthlyGraphPointCopyWith<$Res> {
  __$MonthlyGraphPointCopyWithImpl(this._self, this._then);

  final _MonthlyGraphPoint _self;
  final $Res Function(_MonthlyGraphPoint) _then;

/// Create a copy of MonthlyGraphPoint
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? month = null,Object? totalAmount = null,Object? count = null,}) {
  return _then(_MonthlyGraphPoint(
month: null == month ? _self.month : month // ignore: cast_nullable_to_non_nullable
as String,totalAmount: null == totalAmount ? _self.totalAmount : totalAmount // ignore: cast_nullable_to_non_nullable
as double,count: null == count ? _self.count : count // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$WarehouseStock {

 String get warehouseId; String get warehouseName;@JsonKey(fromJson: _toDouble) double get totalQuantity;@JsonKey(fromJson: _toDouble) double get totalStockValue;
/// Create a copy of WarehouseStock
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WarehouseStockCopyWith<WarehouseStock> get copyWith => _$WarehouseStockCopyWithImpl<WarehouseStock>(this as WarehouseStock, _$identity);

  /// Serializes this WarehouseStock to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is WarehouseStock&&(identical(other.warehouseId, warehouseId) || other.warehouseId == warehouseId)&&(identical(other.warehouseName, warehouseName) || other.warehouseName == warehouseName)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity)&&(identical(other.totalStockValue, totalStockValue) || other.totalStockValue == totalStockValue));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,warehouseId,warehouseName,totalQuantity,totalStockValue);

@override
String toString() {
  return 'WarehouseStock(warehouseId: $warehouseId, warehouseName: $warehouseName, totalQuantity: $totalQuantity, totalStockValue: $totalStockValue)';
}


}

/// @nodoc
abstract mixin class $WarehouseStockCopyWith<$Res>  {
  factory $WarehouseStockCopyWith(WarehouseStock value, $Res Function(WarehouseStock) _then) = _$WarehouseStockCopyWithImpl;
@useResult
$Res call({
 String warehouseId, String warehouseName,@JsonKey(fromJson: _toDouble) double totalQuantity,@JsonKey(fromJson: _toDouble) double totalStockValue
});




}
/// @nodoc
class _$WarehouseStockCopyWithImpl<$Res>
    implements $WarehouseStockCopyWith<$Res> {
  _$WarehouseStockCopyWithImpl(this._self, this._then);

  final WarehouseStock _self;
  final $Res Function(WarehouseStock) _then;

/// Create a copy of WarehouseStock
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? warehouseId = null,Object? warehouseName = null,Object? totalQuantity = null,Object? totalStockValue = null,}) {
  return _then(_self.copyWith(
warehouseId: null == warehouseId ? _self.warehouseId : warehouseId // ignore: cast_nullable_to_non_nullable
as String,warehouseName: null == warehouseName ? _self.warehouseName : warehouseName // ignore: cast_nullable_to_non_nullable
as String,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,totalStockValue: null == totalStockValue ? _self.totalStockValue : totalStockValue // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [WarehouseStock].
extension WarehouseStockPatterns on WarehouseStock {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _WarehouseStock value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _WarehouseStock() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _WarehouseStock value)  $default,){
final _that = this;
switch (_that) {
case _WarehouseStock():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _WarehouseStock value)?  $default,){
final _that = this;
switch (_that) {
case _WarehouseStock() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String warehouseId,  String warehouseName, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double totalStockValue)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _WarehouseStock() when $default != null:
return $default(_that.warehouseId,_that.warehouseName,_that.totalQuantity,_that.totalStockValue);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String warehouseId,  String warehouseName, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double totalStockValue)  $default,) {final _that = this;
switch (_that) {
case _WarehouseStock():
return $default(_that.warehouseId,_that.warehouseName,_that.totalQuantity,_that.totalStockValue);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String warehouseId,  String warehouseName, @JsonKey(fromJson: _toDouble)  double totalQuantity, @JsonKey(fromJson: _toDouble)  double totalStockValue)?  $default,) {final _that = this;
switch (_that) {
case _WarehouseStock() when $default != null:
return $default(_that.warehouseId,_that.warehouseName,_that.totalQuantity,_that.totalStockValue);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _WarehouseStock implements WarehouseStock {
  const _WarehouseStock({required this.warehouseId, required this.warehouseName, @JsonKey(fromJson: _toDouble) required this.totalQuantity, @JsonKey(fromJson: _toDouble) required this.totalStockValue});
  factory _WarehouseStock.fromJson(Map<String, dynamic> json) => _$WarehouseStockFromJson(json);

@override final  String warehouseId;
@override final  String warehouseName;
@override@JsonKey(fromJson: _toDouble) final  double totalQuantity;
@override@JsonKey(fromJson: _toDouble) final  double totalStockValue;

/// Create a copy of WarehouseStock
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$WarehouseStockCopyWith<_WarehouseStock> get copyWith => __$WarehouseStockCopyWithImpl<_WarehouseStock>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$WarehouseStockToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _WarehouseStock&&(identical(other.warehouseId, warehouseId) || other.warehouseId == warehouseId)&&(identical(other.warehouseName, warehouseName) || other.warehouseName == warehouseName)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity)&&(identical(other.totalStockValue, totalStockValue) || other.totalStockValue == totalStockValue));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,warehouseId,warehouseName,totalQuantity,totalStockValue);

@override
String toString() {
  return 'WarehouseStock(warehouseId: $warehouseId, warehouseName: $warehouseName, totalQuantity: $totalQuantity, totalStockValue: $totalStockValue)';
}


}

/// @nodoc
abstract mixin class _$WarehouseStockCopyWith<$Res> implements $WarehouseStockCopyWith<$Res> {
  factory _$WarehouseStockCopyWith(_WarehouseStock value, $Res Function(_WarehouseStock) _then) = __$WarehouseStockCopyWithImpl;
@override @useResult
$Res call({
 String warehouseId, String warehouseName,@JsonKey(fromJson: _toDouble) double totalQuantity,@JsonKey(fromJson: _toDouble) double totalStockValue
});




}
/// @nodoc
class __$WarehouseStockCopyWithImpl<$Res>
    implements _$WarehouseStockCopyWith<$Res> {
  __$WarehouseStockCopyWithImpl(this._self, this._then);

  final _WarehouseStock _self;
  final $Res Function(_WarehouseStock) _then;

/// Create a copy of WarehouseStock
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? warehouseId = null,Object? warehouseName = null,Object? totalQuantity = null,Object? totalStockValue = null,}) {
  return _then(_WarehouseStock(
warehouseId: null == warehouseId ? _self.warehouseId : warehouseId // ignore: cast_nullable_to_non_nullable
as String,warehouseName: null == warehouseName ? _self.warehouseName : warehouseName // ignore: cast_nullable_to_non_nullable
as String,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,totalStockValue: null == totalStockValue ? _self.totalStockValue : totalStockValue // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}


/// @nodoc
mixin _$CategorySales {

 String get categoryId; String get categoryName;@JsonKey(fromJson: _toDouble) double get totalAmount;@JsonKey(fromJson: _toDouble) double get totalQuantity;
/// Create a copy of CategorySales
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CategorySalesCopyWith<CategorySales> get copyWith => _$CategorySalesCopyWithImpl<CategorySales>(this as CategorySales, _$identity);

  /// Serializes this CategorySales to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CategorySales&&(identical(other.categoryId, categoryId) || other.categoryId == categoryId)&&(identical(other.categoryName, categoryName) || other.categoryName == categoryName)&&(identical(other.totalAmount, totalAmount) || other.totalAmount == totalAmount)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,categoryId,categoryName,totalAmount,totalQuantity);

@override
String toString() {
  return 'CategorySales(categoryId: $categoryId, categoryName: $categoryName, totalAmount: $totalAmount, totalQuantity: $totalQuantity)';
}


}

/// @nodoc
abstract mixin class $CategorySalesCopyWith<$Res>  {
  factory $CategorySalesCopyWith(CategorySales value, $Res Function(CategorySales) _then) = _$CategorySalesCopyWithImpl;
@useResult
$Res call({
 String categoryId, String categoryName,@JsonKey(fromJson: _toDouble) double totalAmount,@JsonKey(fromJson: _toDouble) double totalQuantity
});




}
/// @nodoc
class _$CategorySalesCopyWithImpl<$Res>
    implements $CategorySalesCopyWith<$Res> {
  _$CategorySalesCopyWithImpl(this._self, this._then);

  final CategorySales _self;
  final $Res Function(CategorySales) _then;

/// Create a copy of CategorySales
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? categoryId = null,Object? categoryName = null,Object? totalAmount = null,Object? totalQuantity = null,}) {
  return _then(_self.copyWith(
categoryId: null == categoryId ? _self.categoryId : categoryId // ignore: cast_nullable_to_non_nullable
as String,categoryName: null == categoryName ? _self.categoryName : categoryName // ignore: cast_nullable_to_non_nullable
as String,totalAmount: null == totalAmount ? _self.totalAmount : totalAmount // ignore: cast_nullable_to_non_nullable
as double,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [CategorySales].
extension CategorySalesPatterns on CategorySales {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CategorySales value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CategorySales() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CategorySales value)  $default,){
final _that = this;
switch (_that) {
case _CategorySales():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CategorySales value)?  $default,){
final _that = this;
switch (_that) {
case _CategorySales() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String categoryId,  String categoryName, @JsonKey(fromJson: _toDouble)  double totalAmount, @JsonKey(fromJson: _toDouble)  double totalQuantity)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CategorySales() when $default != null:
return $default(_that.categoryId,_that.categoryName,_that.totalAmount,_that.totalQuantity);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String categoryId,  String categoryName, @JsonKey(fromJson: _toDouble)  double totalAmount, @JsonKey(fromJson: _toDouble)  double totalQuantity)  $default,) {final _that = this;
switch (_that) {
case _CategorySales():
return $default(_that.categoryId,_that.categoryName,_that.totalAmount,_that.totalQuantity);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String categoryId,  String categoryName, @JsonKey(fromJson: _toDouble)  double totalAmount, @JsonKey(fromJson: _toDouble)  double totalQuantity)?  $default,) {final _that = this;
switch (_that) {
case _CategorySales() when $default != null:
return $default(_that.categoryId,_that.categoryName,_that.totalAmount,_that.totalQuantity);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CategorySales implements CategorySales {
  const _CategorySales({required this.categoryId, required this.categoryName, @JsonKey(fromJson: _toDouble) required this.totalAmount, @JsonKey(fromJson: _toDouble) required this.totalQuantity});
  factory _CategorySales.fromJson(Map<String, dynamic> json) => _$CategorySalesFromJson(json);

@override final  String categoryId;
@override final  String categoryName;
@override@JsonKey(fromJson: _toDouble) final  double totalAmount;
@override@JsonKey(fromJson: _toDouble) final  double totalQuantity;

/// Create a copy of CategorySales
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CategorySalesCopyWith<_CategorySales> get copyWith => __$CategorySalesCopyWithImpl<_CategorySales>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CategorySalesToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CategorySales&&(identical(other.categoryId, categoryId) || other.categoryId == categoryId)&&(identical(other.categoryName, categoryName) || other.categoryName == categoryName)&&(identical(other.totalAmount, totalAmount) || other.totalAmount == totalAmount)&&(identical(other.totalQuantity, totalQuantity) || other.totalQuantity == totalQuantity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,categoryId,categoryName,totalAmount,totalQuantity);

@override
String toString() {
  return 'CategorySales(categoryId: $categoryId, categoryName: $categoryName, totalAmount: $totalAmount, totalQuantity: $totalQuantity)';
}


}

/// @nodoc
abstract mixin class _$CategorySalesCopyWith<$Res> implements $CategorySalesCopyWith<$Res> {
  factory _$CategorySalesCopyWith(_CategorySales value, $Res Function(_CategorySales) _then) = __$CategorySalesCopyWithImpl;
@override @useResult
$Res call({
 String categoryId, String categoryName,@JsonKey(fromJson: _toDouble) double totalAmount,@JsonKey(fromJson: _toDouble) double totalQuantity
});




}
/// @nodoc
class __$CategorySalesCopyWithImpl<$Res>
    implements _$CategorySalesCopyWith<$Res> {
  __$CategorySalesCopyWithImpl(this._self, this._then);

  final _CategorySales _self;
  final $Res Function(_CategorySales) _then;

/// Create a copy of CategorySales
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? categoryId = null,Object? categoryName = null,Object? totalAmount = null,Object? totalQuantity = null,}) {
  return _then(_CategorySales(
categoryId: null == categoryId ? _self.categoryId : categoryId // ignore: cast_nullable_to_non_nullable
as String,categoryName: null == categoryName ? _self.categoryName : categoryName // ignore: cast_nullable_to_non_nullable
as String,totalAmount: null == totalAmount ? _self.totalAmount : totalAmount // ignore: cast_nullable_to_non_nullable
as double,totalQuantity: null == totalQuantity ? _self.totalQuantity : totalQuantity // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}

// dart format on
