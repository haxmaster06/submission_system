// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

User _$UserFromJson(Map<String, dynamic> json) {
  return _User.fromJson(json);
}

/// @nodoc
mixin _$User {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  @JsonKey(name: 'role_id')
  int? get roleId => throw _privateConstructorUsedError;
  @JsonKey(name: 'division_id')
  int? get divisionId => throw _privateConstructorUsedError;
  @JsonKey(name: 'role_name', readValue: _readRoleName)
  String? get roleName => throw _privateConstructorUsedError;
  @JsonKey(name: 'division_name', readValue: _readDivisionName)
  String? get divisionName => throw _privateConstructorUsedError;
  @JsonKey(name: 'signature_path')
  String? get signaturePath => throw _privateConstructorUsedError;
  List<Map<String, dynamic>> get permissions =>
      throw _privateConstructorUsedError;

  /// Serializes this User to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserCopyWith<User> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserCopyWith<$Res> {
  factory $UserCopyWith(User value, $Res Function(User) then) =
      _$UserCopyWithImpl<$Res, User>;
  @useResult
  $Res call({
    int id,
    String name,
    String email,
    @JsonKey(name: 'role_id') int? roleId,
    @JsonKey(name: 'division_id') int? divisionId,
    @JsonKey(name: 'role_name', readValue: _readRoleName) String? roleName,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    String? divisionName,
    @JsonKey(name: 'signature_path') String? signaturePath,
    List<Map<String, dynamic>> permissions,
  });
}

/// @nodoc
class _$UserCopyWithImpl<$Res, $Val extends User>
    implements $UserCopyWith<$Res> {
  _$UserCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = null,
    Object? roleId = freezed,
    Object? divisionId = freezed,
    Object? roleName = freezed,
    Object? divisionName = freezed,
    Object? signaturePath = freezed,
    Object? permissions = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            email: null == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String,
            roleId: freezed == roleId
                ? _value.roleId
                : roleId // ignore: cast_nullable_to_non_nullable
                      as int?,
            divisionId: freezed == divisionId
                ? _value.divisionId
                : divisionId // ignore: cast_nullable_to_non_nullable
                      as int?,
            roleName: freezed == roleName
                ? _value.roleName
                : roleName // ignore: cast_nullable_to_non_nullable
                      as String?,
            divisionName: freezed == divisionName
                ? _value.divisionName
                : divisionName // ignore: cast_nullable_to_non_nullable
                      as String?,
            signaturePath: freezed == signaturePath
                ? _value.signaturePath
                : signaturePath // ignore: cast_nullable_to_non_nullable
                      as String?,
            permissions: null == permissions
                ? _value.permissions
                : permissions // ignore: cast_nullable_to_non_nullable
                      as List<Map<String, dynamic>>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UserImplCopyWith<$Res> implements $UserCopyWith<$Res> {
  factory _$$UserImplCopyWith(
    _$UserImpl value,
    $Res Function(_$UserImpl) then,
  ) = __$$UserImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String name,
    String email,
    @JsonKey(name: 'role_id') int? roleId,
    @JsonKey(name: 'division_id') int? divisionId,
    @JsonKey(name: 'role_name', readValue: _readRoleName) String? roleName,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    String? divisionName,
    @JsonKey(name: 'signature_path') String? signaturePath,
    List<Map<String, dynamic>> permissions,
  });
}

/// @nodoc
class __$$UserImplCopyWithImpl<$Res>
    extends _$UserCopyWithImpl<$Res, _$UserImpl>
    implements _$$UserImplCopyWith<$Res> {
  __$$UserImplCopyWithImpl(_$UserImpl _value, $Res Function(_$UserImpl) _then)
    : super(_value, _then);

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = null,
    Object? roleId = freezed,
    Object? divisionId = freezed,
    Object? roleName = freezed,
    Object? divisionName = freezed,
    Object? signaturePath = freezed,
    Object? permissions = null,
  }) {
    return _then(
      _$UserImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        email: null == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String,
        roleId: freezed == roleId
            ? _value.roleId
            : roleId // ignore: cast_nullable_to_non_nullable
                  as int?,
        divisionId: freezed == divisionId
            ? _value.divisionId
            : divisionId // ignore: cast_nullable_to_non_nullable
                  as int?,
        roleName: freezed == roleName
            ? _value.roleName
            : roleName // ignore: cast_nullable_to_non_nullable
                  as String?,
        divisionName: freezed == divisionName
            ? _value.divisionName
            : divisionName // ignore: cast_nullable_to_non_nullable
                  as String?,
        signaturePath: freezed == signaturePath
            ? _value.signaturePath
            : signaturePath // ignore: cast_nullable_to_non_nullable
                  as String?,
        permissions: null == permissions
            ? _value._permissions
            : permissions // ignore: cast_nullable_to_non_nullable
                  as List<Map<String, dynamic>>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserImpl implements _User {
  const _$UserImpl({
    required this.id,
    required this.name,
    required this.email,
    @JsonKey(name: 'role_id') this.roleId,
    @JsonKey(name: 'division_id') this.divisionId,
    @JsonKey(name: 'role_name', readValue: _readRoleName) this.roleName,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    this.divisionName,
    @JsonKey(name: 'signature_path') this.signaturePath,
    final List<Map<String, dynamic>> permissions = const [],
  }) : _permissions = permissions;

  factory _$UserImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  final String email;
  @override
  @JsonKey(name: 'role_id')
  final int? roleId;
  @override
  @JsonKey(name: 'division_id')
  final int? divisionId;
  @override
  @JsonKey(name: 'role_name', readValue: _readRoleName)
  final String? roleName;
  @override
  @JsonKey(name: 'division_name', readValue: _readDivisionName)
  final String? divisionName;
  @override
  @JsonKey(name: 'signature_path')
  final String? signaturePath;
  final List<Map<String, dynamic>> _permissions;
  @override
  @JsonKey()
  List<Map<String, dynamic>> get permissions {
    if (_permissions is EqualUnmodifiableListView) return _permissions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_permissions);
  }

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email, roleId: $roleId, divisionId: $divisionId, roleName: $roleName, divisionName: $divisionName, signaturePath: $signaturePath, permissions: $permissions)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.roleId, roleId) || other.roleId == roleId) &&
            (identical(other.divisionId, divisionId) ||
                other.divisionId == divisionId) &&
            (identical(other.roleName, roleName) ||
                other.roleName == roleName) &&
            (identical(other.divisionName, divisionName) ||
                other.divisionName == divisionName) &&
            (identical(other.signaturePath, signaturePath) ||
                other.signaturePath == signaturePath) &&
            const DeepCollectionEquality().equals(
              other._permissions,
              _permissions,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    email,
    roleId,
    divisionId,
    roleName,
    divisionName,
    signaturePath,
    const DeepCollectionEquality().hash(_permissions),
  );

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      __$$UserImplCopyWithImpl<_$UserImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserImplToJson(this);
  }
}

abstract class _User implements User {
  const factory _User({
    required final int id,
    required final String name,
    required final String email,
    @JsonKey(name: 'role_id') final int? roleId,
    @JsonKey(name: 'division_id') final int? divisionId,
    @JsonKey(name: 'role_name', readValue: _readRoleName)
    final String? roleName,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    final String? divisionName,
    @JsonKey(name: 'signature_path') final String? signaturePath,
    final List<Map<String, dynamic>> permissions,
  }) = _$UserImpl;

  factory _User.fromJson(Map<String, dynamic> json) = _$UserImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  String get email;
  @override
  @JsonKey(name: 'role_id')
  int? get roleId;
  @override
  @JsonKey(name: 'division_id')
  int? get divisionId;
  @override
  @JsonKey(name: 'role_name', readValue: _readRoleName)
  String? get roleName;
  @override
  @JsonKey(name: 'division_name', readValue: _readDivisionName)
  String? get divisionName;
  @override
  @JsonKey(name: 'signature_path')
  String? get signaturePath;
  @override
  List<Map<String, dynamic>> get permissions;

  /// Create a copy of User
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
