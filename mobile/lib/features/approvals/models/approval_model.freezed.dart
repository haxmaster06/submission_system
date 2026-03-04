// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'approval_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ApprovalItem _$ApprovalItemFromJson(Map<String, dynamic> json) {
  return _ApprovalItem.fromJson(json);
}

/// @nodoc
mixin _$ApprovalItem {
  int get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'submission_id')
  int? get submissionId => throw _privateConstructorUsedError;
  @JsonKey(name: 'role_id')
  int? get roleId => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'step_order')
  int? get stepOrder => throw _privateConstructorUsedError;
  @JsonKey(name: 'approver_id')
  int? get approverId => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError; // Mapped relations
  @JsonKey(name: 'role_name', readValue: _readStageRoleName)
  String? get roleName => throw _privateConstructorUsedError;
  @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
  String? get approverName => throw _privateConstructorUsedError;
  Submission? get submission => throw _privateConstructorUsedError;

  /// Serializes this ApprovalItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ApprovalItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ApprovalItemCopyWith<ApprovalItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ApprovalItemCopyWith<$Res> {
  factory $ApprovalItemCopyWith(
    ApprovalItem value,
    $Res Function(ApprovalItem) then,
  ) = _$ApprovalItemCopyWithImpl<$Res, ApprovalItem>;
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'role_id') int? roleId,
    String status,
    @JsonKey(name: 'step_order') int? stepOrder,
    @JsonKey(name: 'approver_id') int? approverId,
    String? notes,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName) String? roleName,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    String? approverName,
    Submission? submission,
  });

  $SubmissionCopyWith<$Res>? get submission;
}

/// @nodoc
class _$ApprovalItemCopyWithImpl<$Res, $Val extends ApprovalItem>
    implements $ApprovalItemCopyWith<$Res> {
  _$ApprovalItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ApprovalItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? roleId = freezed,
    Object? status = null,
    Object? stepOrder = freezed,
    Object? approverId = freezed,
    Object? notes = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? roleName = freezed,
    Object? approverName = freezed,
    Object? submission = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            submissionId: freezed == submissionId
                ? _value.submissionId
                : submissionId // ignore: cast_nullable_to_non_nullable
                      as int?,
            roleId: freezed == roleId
                ? _value.roleId
                : roleId // ignore: cast_nullable_to_non_nullable
                      as int?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            stepOrder: freezed == stepOrder
                ? _value.stepOrder
                : stepOrder // ignore: cast_nullable_to_non_nullable
                      as int?,
            approverId: freezed == approverId
                ? _value.approverId
                : approverId // ignore: cast_nullable_to_non_nullable
                      as int?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            roleName: freezed == roleName
                ? _value.roleName
                : roleName // ignore: cast_nullable_to_non_nullable
                      as String?,
            approverName: freezed == approverName
                ? _value.approverName
                : approverName // ignore: cast_nullable_to_non_nullable
                      as String?,
            submission: freezed == submission
                ? _value.submission
                : submission // ignore: cast_nullable_to_non_nullable
                      as Submission?,
          )
          as $Val,
    );
  }

  /// Create a copy of ApprovalItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $SubmissionCopyWith<$Res>? get submission {
    if (_value.submission == null) {
      return null;
    }

    return $SubmissionCopyWith<$Res>(_value.submission!, (value) {
      return _then(_value.copyWith(submission: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ApprovalItemImplCopyWith<$Res>
    implements $ApprovalItemCopyWith<$Res> {
  factory _$$ApprovalItemImplCopyWith(
    _$ApprovalItemImpl value,
    $Res Function(_$ApprovalItemImpl) then,
  ) = __$$ApprovalItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'role_id') int? roleId,
    String status,
    @JsonKey(name: 'step_order') int? stepOrder,
    @JsonKey(name: 'approver_id') int? approverId,
    String? notes,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName) String? roleName,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    String? approverName,
    Submission? submission,
  });

  @override
  $SubmissionCopyWith<$Res>? get submission;
}

/// @nodoc
class __$$ApprovalItemImplCopyWithImpl<$Res>
    extends _$ApprovalItemCopyWithImpl<$Res, _$ApprovalItemImpl>
    implements _$$ApprovalItemImplCopyWith<$Res> {
  __$$ApprovalItemImplCopyWithImpl(
    _$ApprovalItemImpl _value,
    $Res Function(_$ApprovalItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ApprovalItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? roleId = freezed,
    Object? status = null,
    Object? stepOrder = freezed,
    Object? approverId = freezed,
    Object? notes = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? roleName = freezed,
    Object? approverName = freezed,
    Object? submission = freezed,
  }) {
    return _then(
      _$ApprovalItemImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        submissionId: freezed == submissionId
            ? _value.submissionId
            : submissionId // ignore: cast_nullable_to_non_nullable
                  as int?,
        roleId: freezed == roleId
            ? _value.roleId
            : roleId // ignore: cast_nullable_to_non_nullable
                  as int?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        stepOrder: freezed == stepOrder
            ? _value.stepOrder
            : stepOrder // ignore: cast_nullable_to_non_nullable
                  as int?,
        approverId: freezed == approverId
            ? _value.approverId
            : approverId // ignore: cast_nullable_to_non_nullable
                  as int?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        roleName: freezed == roleName
            ? _value.roleName
            : roleName // ignore: cast_nullable_to_non_nullable
                  as String?,
        approverName: freezed == approverName
            ? _value.approverName
            : approverName // ignore: cast_nullable_to_non_nullable
                  as String?,
        submission: freezed == submission
            ? _value.submission
            : submission // ignore: cast_nullable_to_non_nullable
                  as Submission?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ApprovalItemImpl implements _ApprovalItem {
  const _$ApprovalItemImpl({
    required this.id,
    @JsonKey(name: 'submission_id') this.submissionId,
    @JsonKey(name: 'role_id') this.roleId,
    required this.status,
    @JsonKey(name: 'step_order') this.stepOrder,
    @JsonKey(name: 'approver_id') this.approverId,
    this.notes,
    @JsonKey(name: 'created_at') this.createdAt,
    @JsonKey(name: 'updated_at') this.updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName) this.roleName,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    this.approverName,
    this.submission,
  });

  factory _$ApprovalItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$ApprovalItemImplFromJson(json);

  @override
  final int id;
  @override
  @JsonKey(name: 'submission_id')
  final int? submissionId;
  @override
  @JsonKey(name: 'role_id')
  final int? roleId;
  @override
  final String status;
  @override
  @JsonKey(name: 'step_order')
  final int? stepOrder;
  @override
  @JsonKey(name: 'approver_id')
  final int? approverId;
  @override
  final String? notes;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  // Mapped relations
  @override
  @JsonKey(name: 'role_name', readValue: _readStageRoleName)
  final String? roleName;
  @override
  @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
  final String? approverName;
  @override
  final Submission? submission;

  @override
  String toString() {
    return 'ApprovalItem(id: $id, submissionId: $submissionId, roleId: $roleId, status: $status, stepOrder: $stepOrder, approverId: $approverId, notes: $notes, createdAt: $createdAt, updatedAt: $updatedAt, roleName: $roleName, approverName: $approverName, submission: $submission)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ApprovalItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.submissionId, submissionId) ||
                other.submissionId == submissionId) &&
            (identical(other.roleId, roleId) || other.roleId == roleId) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.stepOrder, stepOrder) ||
                other.stepOrder == stepOrder) &&
            (identical(other.approverId, approverId) ||
                other.approverId == approverId) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.roleName, roleName) ||
                other.roleName == roleName) &&
            (identical(other.approverName, approverName) ||
                other.approverName == approverName) &&
            (identical(other.submission, submission) ||
                other.submission == submission));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    submissionId,
    roleId,
    status,
    stepOrder,
    approverId,
    notes,
    createdAt,
    updatedAt,
    roleName,
    approverName,
    submission,
  );

  /// Create a copy of ApprovalItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ApprovalItemImplCopyWith<_$ApprovalItemImpl> get copyWith =>
      __$$ApprovalItemImplCopyWithImpl<_$ApprovalItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ApprovalItemImplToJson(this);
  }
}

abstract class _ApprovalItem implements ApprovalItem {
  const factory _ApprovalItem({
    required final int id,
    @JsonKey(name: 'submission_id') final int? submissionId,
    @JsonKey(name: 'role_id') final int? roleId,
    required final String status,
    @JsonKey(name: 'step_order') final int? stepOrder,
    @JsonKey(name: 'approver_id') final int? approverId,
    final String? notes,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    @JsonKey(name: 'updated_at') final DateTime? updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName)
    final String? roleName,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    final String? approverName,
    final Submission? submission,
  }) = _$ApprovalItemImpl;

  factory _ApprovalItem.fromJson(Map<String, dynamic> json) =
      _$ApprovalItemImpl.fromJson;

  @override
  int get id;
  @override
  @JsonKey(name: 'submission_id')
  int? get submissionId;
  @override
  @JsonKey(name: 'role_id')
  int? get roleId;
  @override
  String get status;
  @override
  @JsonKey(name: 'step_order')
  int? get stepOrder;
  @override
  @JsonKey(name: 'approver_id')
  int? get approverId;
  @override
  String? get notes;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt; // Mapped relations
  @override
  @JsonKey(name: 'role_name', readValue: _readStageRoleName)
  String? get roleName;
  @override
  @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
  String? get approverName;
  @override
  Submission? get submission;

  /// Create a copy of ApprovalItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ApprovalItemImplCopyWith<_$ApprovalItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
