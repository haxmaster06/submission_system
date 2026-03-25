// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'submission_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Submission _$SubmissionFromJson(Map<String, dynamic> json) {
  return _Submission.fromJson(json);
}

/// @nodoc
mixin _$Submission {
  int get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'user_id')
  int get userId => throw _privateConstructorUsedError;
  @JsonKey(name: 'division_id')
  int get divisionId => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readSubmissionType)
  String get type => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readSubmissionNotes)
  String get notes => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readSubmissionStatus)
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
  bool get isUrgent => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readSubmissionTotal)
  double get total => throw _privateConstructorUsedError;
  @JsonKey(name: 'current_approval_step')
  int get current_approval_step => throw _privateConstructorUsedError;
  @JsonKey(name: 'current_step_role')
  String? get current_step_role => throw _privateConstructorUsedError; // Relations that might come with the list/detail
  String? get description => throw _privateConstructorUsedError;
  @JsonKey(name: 'user_name', readValue: _readUserName)
  String? get user_name => throw _privateConstructorUsedError;
  @JsonKey(name: 'division_name', readValue: _readDivisionName)
  String? get division_name => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readSubmissionDetails)
  List<SubmissionDetail> get details => throw _privateConstructorUsedError;
  @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
  List<ApprovalStage> get approval_stages => throw _privateConstructorUsedError;
  List<Attachment> get attachments => throw _privateConstructorUsedError;
  List<AttachmentRequestModel> get attachmentRequests =>
      throw _privateConstructorUsedError;
  Map<String, dynamic>? get payload => throw _privateConstructorUsedError;

  /// Serializes this Submission to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Submission
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SubmissionCopyWith<Submission> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SubmissionCopyWith<$Res> {
  factory $SubmissionCopyWith(
    Submission value,
    $Res Function(Submission) then,
  ) = _$SubmissionCopyWithImpl<$Res, Submission>;
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'user_id') int userId,
    @JsonKey(name: 'division_id') int divisionId,
    @JsonKey(readValue: _readSubmissionType) String type,
    @JsonKey(readValue: _readSubmissionNotes) String notes,
    @JsonKey(readValue: _readSubmissionStatus) String status,
    @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
    bool isUrgent,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(readValue: _readSubmissionTotal) double total,
    @JsonKey(name: 'current_approval_step') int current_approval_step,
    @JsonKey(name: 'current_step_role') String? current_step_role,
    String? description,
    @JsonKey(name: 'user_name', readValue: _readUserName) String? user_name,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    String? division_name,
    @JsonKey(readValue: _readSubmissionDetails) List<SubmissionDetail> details,
    @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
    List<ApprovalStage> approval_stages,
    List<Attachment> attachments,
    List<AttachmentRequestModel> attachmentRequests,
    Map<String, dynamic>? payload,
  });
}

/// @nodoc
class _$SubmissionCopyWithImpl<$Res, $Val extends Submission>
    implements $SubmissionCopyWith<$Res> {
  _$SubmissionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Submission
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? divisionId = null,
    Object? type = null,
    Object? notes = null,
    Object? status = null,
    Object? isUrgent = null,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? total = null,
    Object? current_approval_step = null,
    Object? current_step_role = freezed,
    Object? description = freezed,
    Object? user_name = freezed,
    Object? division_name = freezed,
    Object? details = null,
    Object? approval_stages = null,
    Object? attachments = null,
    Object? attachmentRequests = null,
    Object? payload = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as int,
            divisionId: null == divisionId
                ? _value.divisionId
                : divisionId // ignore: cast_nullable_to_non_nullable
                      as int,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            notes: null == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            isUrgent: null == isUrgent
                ? _value.isUrgent
                : isUrgent // ignore: cast_nullable_to_non_nullable
                      as bool,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            total: null == total
                ? _value.total
                : total // ignore: cast_nullable_to_non_nullable
                      as double,
            current_approval_step: null == current_approval_step
                ? _value.current_approval_step
                : current_approval_step // ignore: cast_nullable_to_non_nullable
                      as int,
            current_step_role: freezed == current_step_role
                ? _value.current_step_role
                : current_step_role // ignore: cast_nullable_to_non_nullable
                      as String?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            user_name: freezed == user_name
                ? _value.user_name
                : user_name // ignore: cast_nullable_to_non_nullable
                      as String?,
            division_name: freezed == division_name
                ? _value.division_name
                : division_name // ignore: cast_nullable_to_non_nullable
                      as String?,
            details: null == details
                ? _value.details
                : details // ignore: cast_nullable_to_non_nullable
                      as List<SubmissionDetail>,
            approval_stages: null == approval_stages
                ? _value.approval_stages
                : approval_stages // ignore: cast_nullable_to_non_nullable
                      as List<ApprovalStage>,
            attachments: null == attachments
                ? _value.attachments
                : attachments // ignore: cast_nullable_to_non_nullable
                      as List<Attachment>,
            attachmentRequests: null == attachmentRequests
                ? _value.attachmentRequests
                : attachmentRequests // ignore: cast_nullable_to_non_nullable
                      as List<AttachmentRequestModel>,
            payload: freezed == payload
                ? _value.payload
                : payload // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SubmissionImplCopyWith<$Res>
    implements $SubmissionCopyWith<$Res> {
  factory _$$SubmissionImplCopyWith(
    _$SubmissionImpl value,
    $Res Function(_$SubmissionImpl) then,
  ) = __$$SubmissionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'user_id') int userId,
    @JsonKey(name: 'division_id') int divisionId,
    @JsonKey(readValue: _readSubmissionType) String type,
    @JsonKey(readValue: _readSubmissionNotes) String notes,
    @JsonKey(readValue: _readSubmissionStatus) String status,
    @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
    bool isUrgent,
    @JsonKey(name: 'created_at') DateTime createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(readValue: _readSubmissionTotal) double total,
    @JsonKey(name: 'current_approval_step') int current_approval_step,
    @JsonKey(name: 'current_step_role') String? current_step_role,
    String? description,
    @JsonKey(name: 'user_name', readValue: _readUserName) String? user_name,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    String? division_name,
    @JsonKey(readValue: _readSubmissionDetails) List<SubmissionDetail> details,
    @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
    List<ApprovalStage> approval_stages,
    List<Attachment> attachments,
    List<AttachmentRequestModel> attachmentRequests,
    Map<String, dynamic>? payload,
  });
}

/// @nodoc
class __$$SubmissionImplCopyWithImpl<$Res>
    extends _$SubmissionCopyWithImpl<$Res, _$SubmissionImpl>
    implements _$$SubmissionImplCopyWith<$Res> {
  __$$SubmissionImplCopyWithImpl(
    _$SubmissionImpl _value,
    $Res Function(_$SubmissionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Submission
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? divisionId = null,
    Object? type = null,
    Object? notes = null,
    Object? status = null,
    Object? isUrgent = null,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? total = null,
    Object? current_approval_step = null,
    Object? current_step_role = freezed,
    Object? description = freezed,
    Object? user_name = freezed,
    Object? division_name = freezed,
    Object? details = null,
    Object? approval_stages = null,
    Object? attachments = null,
    Object? attachmentRequests = null,
    Object? payload = freezed,
  }) {
    return _then(
      _$SubmissionImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as int,
        divisionId: null == divisionId
            ? _value.divisionId
            : divisionId // ignore: cast_nullable_to_non_nullable
                  as int,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        notes: null == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        isUrgent: null == isUrgent
            ? _value.isUrgent
            : isUrgent // ignore: cast_nullable_to_non_nullable
                  as bool,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        total: null == total
            ? _value.total
            : total // ignore: cast_nullable_to_non_nullable
                  as double,
        current_approval_step: null == current_approval_step
            ? _value.current_approval_step
            : current_approval_step // ignore: cast_nullable_to_non_nullable
                  as int,
        current_step_role: freezed == current_step_role
            ? _value.current_step_role
            : current_step_role // ignore: cast_nullable_to_non_nullable
                  as String?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        user_name: freezed == user_name
            ? _value.user_name
            : user_name // ignore: cast_nullable_to_non_nullable
                  as String?,
        division_name: freezed == division_name
            ? _value.division_name
            : division_name // ignore: cast_nullable_to_non_nullable
                  as String?,
        details: null == details
            ? _value._details
            : details // ignore: cast_nullable_to_non_nullable
                  as List<SubmissionDetail>,
        approval_stages: null == approval_stages
            ? _value._approval_stages
            : approval_stages // ignore: cast_nullable_to_non_nullable
                  as List<ApprovalStage>,
        attachments: null == attachments
            ? _value._attachments
            : attachments // ignore: cast_nullable_to_non_nullable
                  as List<Attachment>,
        attachmentRequests: null == attachmentRequests
            ? _value._attachmentRequests
            : attachmentRequests // ignore: cast_nullable_to_non_nullable
                  as List<AttachmentRequestModel>,
        payload: freezed == payload
            ? _value._payload
            : payload // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SubmissionImpl implements _Submission {
  const _$SubmissionImpl({
    required this.id,
    @JsonKey(name: 'user_id') required this.userId,
    @JsonKey(name: 'division_id') required this.divisionId,
    @JsonKey(readValue: _readSubmissionType) required this.type,
    @JsonKey(readValue: _readSubmissionNotes) required this.notes,
    @JsonKey(readValue: _readSubmissionStatus) required this.status,
    @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
    required this.isUrgent,
    @JsonKey(name: 'created_at') required this.createdAt,
    @JsonKey(name: 'updated_at') this.updatedAt,
    @JsonKey(readValue: _readSubmissionTotal) this.total = 0.0,
    @JsonKey(name: 'current_approval_step') this.current_approval_step = 1,
    @JsonKey(name: 'current_step_role') this.current_step_role,
    this.description,
    @JsonKey(name: 'user_name', readValue: _readUserName) this.user_name,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    this.division_name,
    @JsonKey(readValue: _readSubmissionDetails)
    final List<SubmissionDetail> details = const [],
    @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
    final List<ApprovalStage> approval_stages = const [],
    final List<Attachment> attachments = const [],
    final List<AttachmentRequestModel> attachmentRequests = const [],
    final Map<String, dynamic>? payload,
  }) : _details = details,
       _approval_stages = approval_stages,
       _attachments = attachments,
       _attachmentRequests = attachmentRequests,
       _payload = payload;

  factory _$SubmissionImpl.fromJson(Map<String, dynamic> json) =>
      _$$SubmissionImplFromJson(json);

  @override
  final int id;
  @override
  @JsonKey(name: 'user_id')
  final int userId;
  @override
  @JsonKey(name: 'division_id')
  final int divisionId;
  @override
  @JsonKey(readValue: _readSubmissionType)
  final String type;
  @override
  @JsonKey(readValue: _readSubmissionNotes)
  final String notes;
  @override
  @JsonKey(readValue: _readSubmissionStatus)
  final String status;
  @override
  @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
  final bool isUrgent;
  @override
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  @override
  @JsonKey(readValue: _readSubmissionTotal)
  final double total;
  @override
  @JsonKey(name: 'current_approval_step')
  final int current_approval_step;
  @override
  @JsonKey(name: 'current_step_role')
  final String? current_step_role;
  // Relations that might come with the list/detail
  @override
  final String? description;
  @override
  @JsonKey(name: 'user_name', readValue: _readUserName)
  final String? user_name;
  @override
  @JsonKey(name: 'division_name', readValue: _readDivisionName)
  final String? division_name;
  final List<SubmissionDetail> _details;
  @override
  @JsonKey(readValue: _readSubmissionDetails)
  List<SubmissionDetail> get details {
    if (_details is EqualUnmodifiableListView) return _details;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_details);
  }

  final List<ApprovalStage> _approval_stages;
  @override
  @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
  List<ApprovalStage> get approval_stages {
    if (_approval_stages is EqualUnmodifiableListView) return _approval_stages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_approval_stages);
  }

  final List<Attachment> _attachments;
  @override
  @JsonKey()
  List<Attachment> get attachments {
    if (_attachments is EqualUnmodifiableListView) return _attachments;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_attachments);
  }

  final List<AttachmentRequestModel> _attachmentRequests;
  @override
  @JsonKey()
  List<AttachmentRequestModel> get attachmentRequests {
    if (_attachmentRequests is EqualUnmodifiableListView)
      return _attachmentRequests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_attachmentRequests);
  }

  final Map<String, dynamic>? _payload;
  @override
  Map<String, dynamic>? get payload {
    final value = _payload;
    if (value == null) return null;
    if (_payload is EqualUnmodifiableMapView) return _payload;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'Submission(id: $id, userId: $userId, divisionId: $divisionId, type: $type, notes: $notes, status: $status, isUrgent: $isUrgent, createdAt: $createdAt, updatedAt: $updatedAt, total: $total, current_approval_step: $current_approval_step, current_step_role: $current_step_role, description: $description, user_name: $user_name, division_name: $division_name, details: $details, approval_stages: $approval_stages, attachments: $attachments, attachmentRequests: $attachmentRequests, payload: $payload)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SubmissionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.divisionId, divisionId) ||
                other.divisionId == divisionId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.isUrgent, isUrgent) ||
                other.isUrgent == isUrgent) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.current_approval_step, current_approval_step) ||
                other.current_approval_step == current_approval_step) &&
            (identical(other.current_step_role, current_step_role) ||
                other.current_step_role == current_step_role) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.user_name, user_name) ||
                other.user_name == user_name) &&
            (identical(other.division_name, division_name) ||
                other.division_name == division_name) &&
            const DeepCollectionEquality().equals(other._details, _details) &&
            const DeepCollectionEquality().equals(
              other._approval_stages,
              _approval_stages,
            ) &&
            const DeepCollectionEquality().equals(
              other._attachments,
              _attachments,
            ) &&
            const DeepCollectionEquality().equals(
              other._attachmentRequests,
              _attachmentRequests,
            ) &&
            const DeepCollectionEquality().equals(other._payload, _payload));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    userId,
    divisionId,
    type,
    notes,
    status,
    isUrgent,
    createdAt,
    updatedAt,
    total,
    current_approval_step,
    current_step_role,
    description,
    user_name,
    division_name,
    const DeepCollectionEquality().hash(_details),
    const DeepCollectionEquality().hash(_approval_stages),
    const DeepCollectionEquality().hash(_attachments),
    const DeepCollectionEquality().hash(_attachmentRequests),
    const DeepCollectionEquality().hash(_payload),
  ]);

  /// Create a copy of Submission
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SubmissionImplCopyWith<_$SubmissionImpl> get copyWith =>
      __$$SubmissionImplCopyWithImpl<_$SubmissionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SubmissionImplToJson(this);
  }
}

abstract class _Submission implements Submission {
  const factory _Submission({
    required final int id,
    @JsonKey(name: 'user_id') required final int userId,
    @JsonKey(name: 'division_id') required final int divisionId,
    @JsonKey(readValue: _readSubmissionType) required final String type,
    @JsonKey(readValue: _readSubmissionNotes) required final String notes,
    @JsonKey(readValue: _readSubmissionStatus) required final String status,
    @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
    required final bool isUrgent,
    @JsonKey(name: 'created_at') required final DateTime createdAt,
    @JsonKey(name: 'updated_at') final DateTime? updatedAt,
    @JsonKey(readValue: _readSubmissionTotal) final double total,
    @JsonKey(name: 'current_approval_step') final int current_approval_step,
    @JsonKey(name: 'current_step_role') final String? current_step_role,
    final String? description,
    @JsonKey(name: 'user_name', readValue: _readUserName)
    final String? user_name,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    final String? division_name,
    @JsonKey(readValue: _readSubmissionDetails)
    final List<SubmissionDetail> details,
    @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
    final List<ApprovalStage> approval_stages,
    final List<Attachment> attachments,
    final List<AttachmentRequestModel> attachmentRequests,
    final Map<String, dynamic>? payload,
  }) = _$SubmissionImpl;

  factory _Submission.fromJson(Map<String, dynamic> json) =
      _$SubmissionImpl.fromJson;

  @override
  int get id;
  @override
  @JsonKey(name: 'user_id')
  int get userId;
  @override
  @JsonKey(name: 'division_id')
  int get divisionId;
  @override
  @JsonKey(readValue: _readSubmissionType)
  String get type;
  @override
  @JsonKey(readValue: _readSubmissionNotes)
  String get notes;
  @override
  @JsonKey(readValue: _readSubmissionStatus)
  String get status;
  @override
  @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
  bool get isUrgent;
  @override
  @JsonKey(name: 'created_at')
  DateTime get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt;
  @override
  @JsonKey(readValue: _readSubmissionTotal)
  double get total;
  @override
  @JsonKey(name: 'current_approval_step')
  int get current_approval_step;
  @override
  @JsonKey(name: 'current_step_role')
  String? get current_step_role; // Relations that might come with the list/detail
  @override
  String? get description;
  @override
  @JsonKey(name: 'user_name', readValue: _readUserName)
  String? get user_name;
  @override
  @JsonKey(name: 'division_name', readValue: _readDivisionName)
  String? get division_name;
  @override
  @JsonKey(readValue: _readSubmissionDetails)
  List<SubmissionDetail> get details;
  @override
  @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
  List<ApprovalStage> get approval_stages;
  @override
  List<Attachment> get attachments;
  @override
  List<AttachmentRequestModel> get attachmentRequests;
  @override
  Map<String, dynamic>? get payload;

  /// Create a copy of Submission
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SubmissionImplCopyWith<_$SubmissionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SubmissionDetail _$SubmissionDetailFromJson(Map<String, dynamic> json) {
  return _SubmissionDetail.fromJson(json);
}

/// @nodoc
mixin _$SubmissionDetail {
  int get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'submission_id')
  int? get submissionId => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readDetailDescription)
  String get description => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readDetailAmount)
  double get amount => throw _privateConstructorUsedError;
  String? get receipt_path => throw _privateConstructorUsedError;

  /// Serializes this SubmissionDetail to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SubmissionDetail
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SubmissionDetailCopyWith<SubmissionDetail> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SubmissionDetailCopyWith<$Res> {
  factory $SubmissionDetailCopyWith(
    SubmissionDetail value,
    $Res Function(SubmissionDetail) then,
  ) = _$SubmissionDetailCopyWithImpl<$Res, SubmissionDetail>;
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(readValue: _readDetailDescription) String description,
    @JsonKey(readValue: _readDetailAmount) double amount,
    String? receipt_path,
  });
}

/// @nodoc
class _$SubmissionDetailCopyWithImpl<$Res, $Val extends SubmissionDetail>
    implements $SubmissionDetailCopyWith<$Res> {
  _$SubmissionDetailCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SubmissionDetail
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? description = null,
    Object? amount = null,
    Object? receipt_path = freezed,
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
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            receipt_path: freezed == receipt_path
                ? _value.receipt_path
                : receipt_path // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SubmissionDetailImplCopyWith<$Res>
    implements $SubmissionDetailCopyWith<$Res> {
  factory _$$SubmissionDetailImplCopyWith(
    _$SubmissionDetailImpl value,
    $Res Function(_$SubmissionDetailImpl) then,
  ) = __$$SubmissionDetailImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(readValue: _readDetailDescription) String description,
    @JsonKey(readValue: _readDetailAmount) double amount,
    String? receipt_path,
  });
}

/// @nodoc
class __$$SubmissionDetailImplCopyWithImpl<$Res>
    extends _$SubmissionDetailCopyWithImpl<$Res, _$SubmissionDetailImpl>
    implements _$$SubmissionDetailImplCopyWith<$Res> {
  __$$SubmissionDetailImplCopyWithImpl(
    _$SubmissionDetailImpl _value,
    $Res Function(_$SubmissionDetailImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SubmissionDetail
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? description = null,
    Object? amount = null,
    Object? receipt_path = freezed,
  }) {
    return _then(
      _$SubmissionDetailImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        submissionId: freezed == submissionId
            ? _value.submissionId
            : submissionId // ignore: cast_nullable_to_non_nullable
                  as int?,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        receipt_path: freezed == receipt_path
            ? _value.receipt_path
            : receipt_path // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SubmissionDetailImpl implements _SubmissionDetail {
  const _$SubmissionDetailImpl({
    required this.id,
    @JsonKey(name: 'submission_id') this.submissionId,
    @JsonKey(readValue: _readDetailDescription) required this.description,
    @JsonKey(readValue: _readDetailAmount) required this.amount,
    this.receipt_path,
  });

  factory _$SubmissionDetailImpl.fromJson(Map<String, dynamic> json) =>
      _$$SubmissionDetailImplFromJson(json);

  @override
  final int id;
  @override
  @JsonKey(name: 'submission_id')
  final int? submissionId;
  @override
  @JsonKey(readValue: _readDetailDescription)
  final String description;
  @override
  @JsonKey(readValue: _readDetailAmount)
  final double amount;
  @override
  final String? receipt_path;

  @override
  String toString() {
    return 'SubmissionDetail(id: $id, submissionId: $submissionId, description: $description, amount: $amount, receipt_path: $receipt_path)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SubmissionDetailImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.submissionId, submissionId) ||
                other.submissionId == submissionId) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.receipt_path, receipt_path) ||
                other.receipt_path == receipt_path));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    submissionId,
    description,
    amount,
    receipt_path,
  );

  /// Create a copy of SubmissionDetail
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SubmissionDetailImplCopyWith<_$SubmissionDetailImpl> get copyWith =>
      __$$SubmissionDetailImplCopyWithImpl<_$SubmissionDetailImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SubmissionDetailImplToJson(this);
  }
}

abstract class _SubmissionDetail implements SubmissionDetail {
  const factory _SubmissionDetail({
    required final int id,
    @JsonKey(name: 'submission_id') final int? submissionId,
    @JsonKey(readValue: _readDetailDescription)
    required final String description,
    @JsonKey(readValue: _readDetailAmount) required final double amount,
    final String? receipt_path,
  }) = _$SubmissionDetailImpl;

  factory _SubmissionDetail.fromJson(Map<String, dynamic> json) =
      _$SubmissionDetailImpl.fromJson;

  @override
  int get id;
  @override
  @JsonKey(name: 'submission_id')
  int? get submissionId;
  @override
  @JsonKey(readValue: _readDetailDescription)
  String get description;
  @override
  @JsonKey(readValue: _readDetailAmount)
  double get amount;
  @override
  String? get receipt_path;

  /// Create a copy of SubmissionDetail
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SubmissionDetailImplCopyWith<_$SubmissionDetailImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ApprovalStage _$ApprovalStageFromJson(Map<String, dynamic> json) {
  return _ApprovalStage.fromJson(json);
}

/// @nodoc
mixin _$ApprovalStage {
  int get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'submission_id')
  int? get submissionId => throw _privateConstructorUsedError;
  @JsonKey(name: 'role_id')
  int? get roleId => throw _privateConstructorUsedError;
  @JsonKey(readValue: _readStageStatus)
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'step_order')
  int? get step_order => throw _privateConstructorUsedError;
  int? get approver_id => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError; // Mapped relations
  @JsonKey(name: 'role_name', readValue: _readStageRoleName)
  String? get role_name => throw _privateConstructorUsedError;
  @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
  String? get approver_name => throw _privateConstructorUsedError;

  /// Serializes this ApprovalStage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ApprovalStage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ApprovalStageCopyWith<ApprovalStage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ApprovalStageCopyWith<$Res> {
  factory $ApprovalStageCopyWith(
    ApprovalStage value,
    $Res Function(ApprovalStage) then,
  ) = _$ApprovalStageCopyWithImpl<$Res, ApprovalStage>;
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'role_id') int? roleId,
    @JsonKey(readValue: _readStageStatus) String status,
    @JsonKey(name: 'step_order') int? step_order,
    int? approver_id,
    String? notes,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName)
    String? role_name,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    String? approver_name,
  });
}

/// @nodoc
class _$ApprovalStageCopyWithImpl<$Res, $Val extends ApprovalStage>
    implements $ApprovalStageCopyWith<$Res> {
  _$ApprovalStageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ApprovalStage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? roleId = freezed,
    Object? status = null,
    Object? step_order = freezed,
    Object? approver_id = freezed,
    Object? notes = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? role_name = freezed,
    Object? approver_name = freezed,
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
            step_order: freezed == step_order
                ? _value.step_order
                : step_order // ignore: cast_nullable_to_non_nullable
                      as int?,
            approver_id: freezed == approver_id
                ? _value.approver_id
                : approver_id // ignore: cast_nullable_to_non_nullable
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
            role_name: freezed == role_name
                ? _value.role_name
                : role_name // ignore: cast_nullable_to_non_nullable
                      as String?,
            approver_name: freezed == approver_name
                ? _value.approver_name
                : approver_name // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ApprovalStageImplCopyWith<$Res>
    implements $ApprovalStageCopyWith<$Res> {
  factory _$$ApprovalStageImplCopyWith(
    _$ApprovalStageImpl value,
    $Res Function(_$ApprovalStageImpl) then,
  ) = __$$ApprovalStageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'role_id') int? roleId,
    @JsonKey(readValue: _readStageStatus) String status,
    @JsonKey(name: 'step_order') int? step_order,
    int? approver_id,
    String? notes,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName)
    String? role_name,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    String? approver_name,
  });
}

/// @nodoc
class __$$ApprovalStageImplCopyWithImpl<$Res>
    extends _$ApprovalStageCopyWithImpl<$Res, _$ApprovalStageImpl>
    implements _$$ApprovalStageImplCopyWith<$Res> {
  __$$ApprovalStageImplCopyWithImpl(
    _$ApprovalStageImpl _value,
    $Res Function(_$ApprovalStageImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ApprovalStage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? roleId = freezed,
    Object? status = null,
    Object? step_order = freezed,
    Object? approver_id = freezed,
    Object? notes = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? role_name = freezed,
    Object? approver_name = freezed,
  }) {
    return _then(
      _$ApprovalStageImpl(
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
        step_order: freezed == step_order
            ? _value.step_order
            : step_order // ignore: cast_nullable_to_non_nullable
                  as int?,
        approver_id: freezed == approver_id
            ? _value.approver_id
            : approver_id // ignore: cast_nullable_to_non_nullable
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
        role_name: freezed == role_name
            ? _value.role_name
            : role_name // ignore: cast_nullable_to_non_nullable
                  as String?,
        approver_name: freezed == approver_name
            ? _value.approver_name
            : approver_name // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ApprovalStageImpl implements _ApprovalStage {
  const _$ApprovalStageImpl({
    required this.id,
    @JsonKey(name: 'submission_id') this.submissionId,
    @JsonKey(name: 'role_id') this.roleId,
    @JsonKey(readValue: _readStageStatus) required this.status,
    @JsonKey(name: 'step_order') this.step_order,
    this.approver_id,
    this.notes,
    @JsonKey(name: 'created_at') this.createdAt,
    @JsonKey(name: 'updated_at') this.updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName) this.role_name,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    this.approver_name,
  });

  factory _$ApprovalStageImpl.fromJson(Map<String, dynamic> json) =>
      _$$ApprovalStageImplFromJson(json);

  @override
  final int id;
  @override
  @JsonKey(name: 'submission_id')
  final int? submissionId;
  @override
  @JsonKey(name: 'role_id')
  final int? roleId;
  @override
  @JsonKey(readValue: _readStageStatus)
  final String status;
  @override
  @JsonKey(name: 'step_order')
  final int? step_order;
  @override
  final int? approver_id;
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
  final String? role_name;
  @override
  @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
  final String? approver_name;

  @override
  String toString() {
    return 'ApprovalStage(id: $id, submissionId: $submissionId, roleId: $roleId, status: $status, step_order: $step_order, approver_id: $approver_id, notes: $notes, createdAt: $createdAt, updatedAt: $updatedAt, role_name: $role_name, approver_name: $approver_name)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ApprovalStageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.submissionId, submissionId) ||
                other.submissionId == submissionId) &&
            (identical(other.roleId, roleId) || other.roleId == roleId) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.step_order, step_order) ||
                other.step_order == step_order) &&
            (identical(other.approver_id, approver_id) ||
                other.approver_id == approver_id) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.role_name, role_name) ||
                other.role_name == role_name) &&
            (identical(other.approver_name, approver_name) ||
                other.approver_name == approver_name));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    submissionId,
    roleId,
    status,
    step_order,
    approver_id,
    notes,
    createdAt,
    updatedAt,
    role_name,
    approver_name,
  );

  /// Create a copy of ApprovalStage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ApprovalStageImplCopyWith<_$ApprovalStageImpl> get copyWith =>
      __$$ApprovalStageImplCopyWithImpl<_$ApprovalStageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ApprovalStageImplToJson(this);
  }
}

abstract class _ApprovalStage implements ApprovalStage {
  const factory _ApprovalStage({
    required final int id,
    @JsonKey(name: 'submission_id') final int? submissionId,
    @JsonKey(name: 'role_id') final int? roleId,
    @JsonKey(readValue: _readStageStatus) required final String status,
    @JsonKey(name: 'step_order') final int? step_order,
    final int? approver_id,
    final String? notes,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    @JsonKey(name: 'updated_at') final DateTime? updatedAt,
    @JsonKey(name: 'role_name', readValue: _readStageRoleName)
    final String? role_name,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    final String? approver_name,
  }) = _$ApprovalStageImpl;

  factory _ApprovalStage.fromJson(Map<String, dynamic> json) =
      _$ApprovalStageImpl.fromJson;

  @override
  int get id;
  @override
  @JsonKey(name: 'submission_id')
  int? get submissionId;
  @override
  @JsonKey(name: 'role_id')
  int? get roleId;
  @override
  @JsonKey(readValue: _readStageStatus)
  String get status;
  @override
  @JsonKey(name: 'step_order')
  int? get step_order;
  @override
  int? get approver_id;
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
  String? get role_name;
  @override
  @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
  String? get approver_name;

  /// Create a copy of ApprovalStage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ApprovalStageImplCopyWith<_$ApprovalStageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Attachment _$AttachmentFromJson(Map<String, dynamic> json) {
  return _Attachment.fromJson(json);
}

/// @nodoc
mixin _$Attachment {
  int get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'submission_id')
  int? get submissionId => throw _privateConstructorUsedError;
  @JsonKey(name: 'file_path', readValue: _readAttachmentPath)
  String get filePath => throw _privateConstructorUsedError;
  @JsonKey(name: 'file_type', readValue: _readAttachmentType)
  String get fileType => throw _privateConstructorUsedError;
  @JsonKey(name: 'original_name', readValue: _readAttachmentName)
  String get originalName => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Attachment to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Attachment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AttachmentCopyWith<Attachment> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AttachmentCopyWith<$Res> {
  factory $AttachmentCopyWith(
    Attachment value,
    $Res Function(Attachment) then,
  ) = _$AttachmentCopyWithImpl<$Res, Attachment>;
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'file_path', readValue: _readAttachmentPath) String filePath,
    @JsonKey(name: 'file_type', readValue: _readAttachmentType) String fileType,
    @JsonKey(name: 'original_name', readValue: _readAttachmentName)
    String originalName,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  });
}

/// @nodoc
class _$AttachmentCopyWithImpl<$Res, $Val extends Attachment>
    implements $AttachmentCopyWith<$Res> {
  _$AttachmentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Attachment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? filePath = null,
    Object? fileType = null,
    Object? originalName = null,
    Object? createdAt = freezed,
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
            filePath: null == filePath
                ? _value.filePath
                : filePath // ignore: cast_nullable_to_non_nullable
                      as String,
            fileType: null == fileType
                ? _value.fileType
                : fileType // ignore: cast_nullable_to_non_nullable
                      as String,
            originalName: null == originalName
                ? _value.originalName
                : originalName // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AttachmentImplCopyWith<$Res>
    implements $AttachmentCopyWith<$Res> {
  factory _$$AttachmentImplCopyWith(
    _$AttachmentImpl value,
    $Res Function(_$AttachmentImpl) then,
  ) = __$$AttachmentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'file_path', readValue: _readAttachmentPath) String filePath,
    @JsonKey(name: 'file_type', readValue: _readAttachmentType) String fileType,
    @JsonKey(name: 'original_name', readValue: _readAttachmentName)
    String originalName,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  });
}

/// @nodoc
class __$$AttachmentImplCopyWithImpl<$Res>
    extends _$AttachmentCopyWithImpl<$Res, _$AttachmentImpl>
    implements _$$AttachmentImplCopyWith<$Res> {
  __$$AttachmentImplCopyWithImpl(
    _$AttachmentImpl _value,
    $Res Function(_$AttachmentImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Attachment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = freezed,
    Object? filePath = null,
    Object? fileType = null,
    Object? originalName = null,
    Object? createdAt = freezed,
  }) {
    return _then(
      _$AttachmentImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        submissionId: freezed == submissionId
            ? _value.submissionId
            : submissionId // ignore: cast_nullable_to_non_nullable
                  as int?,
        filePath: null == filePath
            ? _value.filePath
            : filePath // ignore: cast_nullable_to_non_nullable
                  as String,
        fileType: null == fileType
            ? _value.fileType
            : fileType // ignore: cast_nullable_to_non_nullable
                  as String,
        originalName: null == originalName
            ? _value.originalName
            : originalName // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AttachmentImpl implements _Attachment {
  const _$AttachmentImpl({
    required this.id,
    @JsonKey(name: 'submission_id') this.submissionId,
    @JsonKey(name: 'file_path', readValue: _readAttachmentPath)
    required this.filePath,
    @JsonKey(name: 'file_type', readValue: _readAttachmentType)
    required this.fileType,
    @JsonKey(name: 'original_name', readValue: _readAttachmentName)
    required this.originalName,
    @JsonKey(name: 'created_at') this.createdAt,
  });

  factory _$AttachmentImpl.fromJson(Map<String, dynamic> json) =>
      _$$AttachmentImplFromJson(json);

  @override
  final int id;
  @override
  @JsonKey(name: 'submission_id')
  final int? submissionId;
  @override
  @JsonKey(name: 'file_path', readValue: _readAttachmentPath)
  final String filePath;
  @override
  @JsonKey(name: 'file_type', readValue: _readAttachmentType)
  final String fileType;
  @override
  @JsonKey(name: 'original_name', readValue: _readAttachmentName)
  final String originalName;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  @override
  String toString() {
    return 'Attachment(id: $id, submissionId: $submissionId, filePath: $filePath, fileType: $fileType, originalName: $originalName, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AttachmentImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.submissionId, submissionId) ||
                other.submissionId == submissionId) &&
            (identical(other.filePath, filePath) ||
                other.filePath == filePath) &&
            (identical(other.fileType, fileType) ||
                other.fileType == fileType) &&
            (identical(other.originalName, originalName) ||
                other.originalName == originalName) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    submissionId,
    filePath,
    fileType,
    originalName,
    createdAt,
  );

  /// Create a copy of Attachment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AttachmentImplCopyWith<_$AttachmentImpl> get copyWith =>
      __$$AttachmentImplCopyWithImpl<_$AttachmentImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AttachmentImplToJson(this);
  }
}

abstract class _Attachment implements Attachment {
  const factory _Attachment({
    required final int id,
    @JsonKey(name: 'submission_id') final int? submissionId,
    @JsonKey(name: 'file_path', readValue: _readAttachmentPath)
    required final String filePath,
    @JsonKey(name: 'file_type', readValue: _readAttachmentType)
    required final String fileType,
    @JsonKey(name: 'original_name', readValue: _readAttachmentName)
    required final String originalName,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
  }) = _$AttachmentImpl;

  factory _Attachment.fromJson(Map<String, dynamic> json) =
      _$AttachmentImpl.fromJson;

  @override
  int get id;
  @override
  @JsonKey(name: 'submission_id')
  int? get submissionId;
  @override
  @JsonKey(name: 'file_path', readValue: _readAttachmentPath)
  String get filePath;
  @override
  @JsonKey(name: 'file_type', readValue: _readAttachmentType)
  String get fileType;
  @override
  @JsonKey(name: 'original_name', readValue: _readAttachmentName)
  String get originalName;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;

  /// Create a copy of Attachment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AttachmentImplCopyWith<_$AttachmentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AttachmentRequestModel _$AttachmentRequestModelFromJson(
  Map<String, dynamic> json,
) {
  return _AttachmentRequestModel.fromJson(json);
}

/// @nodoc
mixin _$AttachmentRequestModel {
  int get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'submission_id')
  int get submissionId => throw _privateConstructorUsedError;
  @JsonKey(name: 'requested_by')
  int get requestedBy => throw _privateConstructorUsedError;
  @JsonKey(name: 'target_user_id')
  int get targetUserId => throw _privateConstructorUsedError;
  @JsonKey(name: 'file_description')
  String get fileDescription => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'attachment_id')
  int? get attachmentId => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError; // Relations
  String? get requester_name => throw _privateConstructorUsedError;
  String? get target_user_name => throw _privateConstructorUsedError;

  /// Serializes this AttachmentRequestModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AttachmentRequestModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AttachmentRequestModelCopyWith<AttachmentRequestModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AttachmentRequestModelCopyWith<$Res> {
  factory $AttachmentRequestModelCopyWith(
    AttachmentRequestModel value,
    $Res Function(AttachmentRequestModel) then,
  ) = _$AttachmentRequestModelCopyWithImpl<$Res, AttachmentRequestModel>;
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int submissionId,
    @JsonKey(name: 'requested_by') int requestedBy,
    @JsonKey(name: 'target_user_id') int targetUserId,
    @JsonKey(name: 'file_description') String fileDescription,
    String status,
    @JsonKey(name: 'attachment_id') int? attachmentId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    String? requester_name,
    String? target_user_name,
  });
}

/// @nodoc
class _$AttachmentRequestModelCopyWithImpl<
  $Res,
  $Val extends AttachmentRequestModel
>
    implements $AttachmentRequestModelCopyWith<$Res> {
  _$AttachmentRequestModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AttachmentRequestModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = null,
    Object? requestedBy = null,
    Object? targetUserId = null,
    Object? fileDescription = null,
    Object? status = null,
    Object? attachmentId = freezed,
    Object? createdAt = freezed,
    Object? requester_name = freezed,
    Object? target_user_name = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            submissionId: null == submissionId
                ? _value.submissionId
                : submissionId // ignore: cast_nullable_to_non_nullable
                      as int,
            requestedBy: null == requestedBy
                ? _value.requestedBy
                : requestedBy // ignore: cast_nullable_to_non_nullable
                      as int,
            targetUserId: null == targetUserId
                ? _value.targetUserId
                : targetUserId // ignore: cast_nullable_to_non_nullable
                      as int,
            fileDescription: null == fileDescription
                ? _value.fileDescription
                : fileDescription // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            attachmentId: freezed == attachmentId
                ? _value.attachmentId
                : attachmentId // ignore: cast_nullable_to_non_nullable
                      as int?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            requester_name: freezed == requester_name
                ? _value.requester_name
                : requester_name // ignore: cast_nullable_to_non_nullable
                      as String?,
            target_user_name: freezed == target_user_name
                ? _value.target_user_name
                : target_user_name // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AttachmentRequestModelImplCopyWith<$Res>
    implements $AttachmentRequestModelCopyWith<$Res> {
  factory _$$AttachmentRequestModelImplCopyWith(
    _$AttachmentRequestModelImpl value,
    $Res Function(_$AttachmentRequestModelImpl) then,
  ) = __$$AttachmentRequestModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'submission_id') int submissionId,
    @JsonKey(name: 'requested_by') int requestedBy,
    @JsonKey(name: 'target_user_id') int targetUserId,
    @JsonKey(name: 'file_description') String fileDescription,
    String status,
    @JsonKey(name: 'attachment_id') int? attachmentId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    String? requester_name,
    String? target_user_name,
  });
}

/// @nodoc
class __$$AttachmentRequestModelImplCopyWithImpl<$Res>
    extends
        _$AttachmentRequestModelCopyWithImpl<$Res, _$AttachmentRequestModelImpl>
    implements _$$AttachmentRequestModelImplCopyWith<$Res> {
  __$$AttachmentRequestModelImplCopyWithImpl(
    _$AttachmentRequestModelImpl _value,
    $Res Function(_$AttachmentRequestModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AttachmentRequestModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? submissionId = null,
    Object? requestedBy = null,
    Object? targetUserId = null,
    Object? fileDescription = null,
    Object? status = null,
    Object? attachmentId = freezed,
    Object? createdAt = freezed,
    Object? requester_name = freezed,
    Object? target_user_name = freezed,
  }) {
    return _then(
      _$AttachmentRequestModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        submissionId: null == submissionId
            ? _value.submissionId
            : submissionId // ignore: cast_nullable_to_non_nullable
                  as int,
        requestedBy: null == requestedBy
            ? _value.requestedBy
            : requestedBy // ignore: cast_nullable_to_non_nullable
                  as int,
        targetUserId: null == targetUserId
            ? _value.targetUserId
            : targetUserId // ignore: cast_nullable_to_non_nullable
                  as int,
        fileDescription: null == fileDescription
            ? _value.fileDescription
            : fileDescription // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        attachmentId: freezed == attachmentId
            ? _value.attachmentId
            : attachmentId // ignore: cast_nullable_to_non_nullable
                  as int?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        requester_name: freezed == requester_name
            ? _value.requester_name
            : requester_name // ignore: cast_nullable_to_non_nullable
                  as String?,
        target_user_name: freezed == target_user_name
            ? _value.target_user_name
            : target_user_name // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AttachmentRequestModelImpl implements _AttachmentRequestModel {
  const _$AttachmentRequestModelImpl({
    required this.id,
    @JsonKey(name: 'submission_id') required this.submissionId,
    @JsonKey(name: 'requested_by') required this.requestedBy,
    @JsonKey(name: 'target_user_id') required this.targetUserId,
    @JsonKey(name: 'file_description') required this.fileDescription,
    required this.status,
    @JsonKey(name: 'attachment_id') this.attachmentId,
    @JsonKey(name: 'created_at') this.createdAt,
    this.requester_name,
    this.target_user_name,
  });

  factory _$AttachmentRequestModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$AttachmentRequestModelImplFromJson(json);

  @override
  final int id;
  @override
  @JsonKey(name: 'submission_id')
  final int submissionId;
  @override
  @JsonKey(name: 'requested_by')
  final int requestedBy;
  @override
  @JsonKey(name: 'target_user_id')
  final int targetUserId;
  @override
  @JsonKey(name: 'file_description')
  final String fileDescription;
  @override
  final String status;
  @override
  @JsonKey(name: 'attachment_id')
  final int? attachmentId;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  // Relations
  @override
  final String? requester_name;
  @override
  final String? target_user_name;

  @override
  String toString() {
    return 'AttachmentRequestModel(id: $id, submissionId: $submissionId, requestedBy: $requestedBy, targetUserId: $targetUserId, fileDescription: $fileDescription, status: $status, attachmentId: $attachmentId, createdAt: $createdAt, requester_name: $requester_name, target_user_name: $target_user_name)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AttachmentRequestModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.submissionId, submissionId) ||
                other.submissionId == submissionId) &&
            (identical(other.requestedBy, requestedBy) ||
                other.requestedBy == requestedBy) &&
            (identical(other.targetUserId, targetUserId) ||
                other.targetUserId == targetUserId) &&
            (identical(other.fileDescription, fileDescription) ||
                other.fileDescription == fileDescription) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.attachmentId, attachmentId) ||
                other.attachmentId == attachmentId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.requester_name, requester_name) ||
                other.requester_name == requester_name) &&
            (identical(other.target_user_name, target_user_name) ||
                other.target_user_name == target_user_name));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    submissionId,
    requestedBy,
    targetUserId,
    fileDescription,
    status,
    attachmentId,
    createdAt,
    requester_name,
    target_user_name,
  );

  /// Create a copy of AttachmentRequestModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AttachmentRequestModelImplCopyWith<_$AttachmentRequestModelImpl>
  get copyWith =>
      __$$AttachmentRequestModelImplCopyWithImpl<_$AttachmentRequestModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$AttachmentRequestModelImplToJson(this);
  }
}

abstract class _AttachmentRequestModel implements AttachmentRequestModel {
  const factory _AttachmentRequestModel({
    required final int id,
    @JsonKey(name: 'submission_id') required final int submissionId,
    @JsonKey(name: 'requested_by') required final int requestedBy,
    @JsonKey(name: 'target_user_id') required final int targetUserId,
    @JsonKey(name: 'file_description') required final String fileDescription,
    required final String status,
    @JsonKey(name: 'attachment_id') final int? attachmentId,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    final String? requester_name,
    final String? target_user_name,
  }) = _$AttachmentRequestModelImpl;

  factory _AttachmentRequestModel.fromJson(Map<String, dynamic> json) =
      _$AttachmentRequestModelImpl.fromJson;

  @override
  int get id;
  @override
  @JsonKey(name: 'submission_id')
  int get submissionId;
  @override
  @JsonKey(name: 'requested_by')
  int get requestedBy;
  @override
  @JsonKey(name: 'target_user_id')
  int get targetUserId;
  @override
  @JsonKey(name: 'file_description')
  String get fileDescription;
  @override
  String get status;
  @override
  @JsonKey(name: 'attachment_id')
  int? get attachmentId;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt; // Relations
  @override
  String? get requester_name;
  @override
  String? get target_user_name;

  /// Create a copy of AttachmentRequestModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AttachmentRequestModelImplCopyWith<_$AttachmentRequestModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}

UserSelectable _$UserSelectableFromJson(Map<String, dynamic> json) {
  return _UserSelectable.fromJson(json);
}

/// @nodoc
mixin _$UserSelectable {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'division_name')
  String? get divisionName => throw _privateConstructorUsedError;

  /// Serializes this UserSelectable to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UserSelectable
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserSelectableCopyWith<UserSelectable> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserSelectableCopyWith<$Res> {
  factory $UserSelectableCopyWith(
    UserSelectable value,
    $Res Function(UserSelectable) then,
  ) = _$UserSelectableCopyWithImpl<$Res, UserSelectable>;
  @useResult
  $Res call({
    int id,
    String name,
    @JsonKey(name: 'division_name') String? divisionName,
  });
}

/// @nodoc
class _$UserSelectableCopyWithImpl<$Res, $Val extends UserSelectable>
    implements $UserSelectableCopyWith<$Res> {
  _$UserSelectableCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserSelectable
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? divisionName = freezed,
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
            divisionName: freezed == divisionName
                ? _value.divisionName
                : divisionName // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UserSelectableImplCopyWith<$Res>
    implements $UserSelectableCopyWith<$Res> {
  factory _$$UserSelectableImplCopyWith(
    _$UserSelectableImpl value,
    $Res Function(_$UserSelectableImpl) then,
  ) = __$$UserSelectableImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String name,
    @JsonKey(name: 'division_name') String? divisionName,
  });
}

/// @nodoc
class __$$UserSelectableImplCopyWithImpl<$Res>
    extends _$UserSelectableCopyWithImpl<$Res, _$UserSelectableImpl>
    implements _$$UserSelectableImplCopyWith<$Res> {
  __$$UserSelectableImplCopyWithImpl(
    _$UserSelectableImpl _value,
    $Res Function(_$UserSelectableImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserSelectable
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? divisionName = freezed,
  }) {
    return _then(
      _$UserSelectableImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        divisionName: freezed == divisionName
            ? _value.divisionName
            : divisionName // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserSelectableImpl implements _UserSelectable {
  const _$UserSelectableImpl({
    required this.id,
    required this.name,
    @JsonKey(name: 'division_name') this.divisionName,
  });

  factory _$UserSelectableImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserSelectableImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  @JsonKey(name: 'division_name')
  final String? divisionName;

  @override
  String toString() {
    return 'UserSelectable(id: $id, name: $name, divisionName: $divisionName)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserSelectableImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.divisionName, divisionName) ||
                other.divisionName == divisionName));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, divisionName);

  /// Create a copy of UserSelectable
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserSelectableImplCopyWith<_$UserSelectableImpl> get copyWith =>
      __$$UserSelectableImplCopyWithImpl<_$UserSelectableImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$UserSelectableImplToJson(this);
  }
}

abstract class _UserSelectable implements UserSelectable {
  const factory _UserSelectable({
    required final int id,
    required final String name,
    @JsonKey(name: 'division_name') final String? divisionName,
  }) = _$UserSelectableImpl;

  factory _UserSelectable.fromJson(Map<String, dynamic> json) =
      _$UserSelectableImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  @JsonKey(name: 'division_name')
  String? get divisionName;

  /// Create a copy of UserSelectable
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserSelectableImplCopyWith<_$UserSelectableImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SalaryPayload _$SalaryPayloadFromJson(Map<String, dynamic> json) {
  return _SalaryPayload.fromJson(json);
}

/// @nodoc
mixin _$SalaryPayload {
  String? get type => throw _privateConstructorUsedError;
  @JsonKey(name: 'date_range')
  Map<String, dynamic>? get dateRange => throw _privateConstructorUsedError;
  List<SalaryEmployee> get employees => throw _privateConstructorUsedError;
  @JsonKey(name: 'total_amount')
  double? get totalAmount => throw _privateConstructorUsedError;

  /// Serializes this SalaryPayload to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SalaryPayload
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SalaryPayloadCopyWith<SalaryPayload> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SalaryPayloadCopyWith<$Res> {
  factory $SalaryPayloadCopyWith(
    SalaryPayload value,
    $Res Function(SalaryPayload) then,
  ) = _$SalaryPayloadCopyWithImpl<$Res, SalaryPayload>;
  @useResult
  $Res call({
    String? type,
    @JsonKey(name: 'date_range') Map<String, dynamic>? dateRange,
    List<SalaryEmployee> employees,
    @JsonKey(name: 'total_amount') double? totalAmount,
  });
}

/// @nodoc
class _$SalaryPayloadCopyWithImpl<$Res, $Val extends SalaryPayload>
    implements $SalaryPayloadCopyWith<$Res> {
  _$SalaryPayloadCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SalaryPayload
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = freezed,
    Object? dateRange = freezed,
    Object? employees = null,
    Object? totalAmount = freezed,
  }) {
    return _then(
      _value.copyWith(
            type: freezed == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String?,
            dateRange: freezed == dateRange
                ? _value.dateRange
                : dateRange // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            employees: null == employees
                ? _value.employees
                : employees // ignore: cast_nullable_to_non_nullable
                      as List<SalaryEmployee>,
            totalAmount: freezed == totalAmount
                ? _value.totalAmount
                : totalAmount // ignore: cast_nullable_to_non_nullable
                      as double?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SalaryPayloadImplCopyWith<$Res>
    implements $SalaryPayloadCopyWith<$Res> {
  factory _$$SalaryPayloadImplCopyWith(
    _$SalaryPayloadImpl value,
    $Res Function(_$SalaryPayloadImpl) then,
  ) = __$$SalaryPayloadImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? type,
    @JsonKey(name: 'date_range') Map<String, dynamic>? dateRange,
    List<SalaryEmployee> employees,
    @JsonKey(name: 'total_amount') double? totalAmount,
  });
}

/// @nodoc
class __$$SalaryPayloadImplCopyWithImpl<$Res>
    extends _$SalaryPayloadCopyWithImpl<$Res, _$SalaryPayloadImpl>
    implements _$$SalaryPayloadImplCopyWith<$Res> {
  __$$SalaryPayloadImplCopyWithImpl(
    _$SalaryPayloadImpl _value,
    $Res Function(_$SalaryPayloadImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SalaryPayload
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = freezed,
    Object? dateRange = freezed,
    Object? employees = null,
    Object? totalAmount = freezed,
  }) {
    return _then(
      _$SalaryPayloadImpl(
        type: freezed == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String?,
        dateRange: freezed == dateRange
            ? _value._dateRange
            : dateRange // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        employees: null == employees
            ? _value._employees
            : employees // ignore: cast_nullable_to_non_nullable
                  as List<SalaryEmployee>,
        totalAmount: freezed == totalAmount
            ? _value.totalAmount
            : totalAmount // ignore: cast_nullable_to_non_nullable
                  as double?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SalaryPayloadImpl implements _SalaryPayload {
  const _$SalaryPayloadImpl({
    this.type,
    @JsonKey(name: 'date_range') final Map<String, dynamic>? dateRange,
    final List<SalaryEmployee> employees = const [],
    @JsonKey(name: 'total_amount') this.totalAmount,
  }) : _dateRange = dateRange,
       _employees = employees;

  factory _$SalaryPayloadImpl.fromJson(Map<String, dynamic> json) =>
      _$$SalaryPayloadImplFromJson(json);

  @override
  final String? type;
  final Map<String, dynamic>? _dateRange;
  @override
  @JsonKey(name: 'date_range')
  Map<String, dynamic>? get dateRange {
    final value = _dateRange;
    if (value == null) return null;
    if (_dateRange is EqualUnmodifiableMapView) return _dateRange;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final List<SalaryEmployee> _employees;
  @override
  @JsonKey()
  List<SalaryEmployee> get employees {
    if (_employees is EqualUnmodifiableListView) return _employees;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_employees);
  }

  @override
  @JsonKey(name: 'total_amount')
  final double? totalAmount;

  @override
  String toString() {
    return 'SalaryPayload(type: $type, dateRange: $dateRange, employees: $employees, totalAmount: $totalAmount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SalaryPayloadImpl &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(
              other._dateRange,
              _dateRange,
            ) &&
            const DeepCollectionEquality().equals(
              other._employees,
              _employees,
            ) &&
            (identical(other.totalAmount, totalAmount) ||
                other.totalAmount == totalAmount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    type,
    const DeepCollectionEquality().hash(_dateRange),
    const DeepCollectionEquality().hash(_employees),
    totalAmount,
  );

  /// Create a copy of SalaryPayload
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SalaryPayloadImplCopyWith<_$SalaryPayloadImpl> get copyWith =>
      __$$SalaryPayloadImplCopyWithImpl<_$SalaryPayloadImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SalaryPayloadImplToJson(this);
  }
}

abstract class _SalaryPayload implements SalaryPayload {
  const factory _SalaryPayload({
    final String? type,
    @JsonKey(name: 'date_range') final Map<String, dynamic>? dateRange,
    final List<SalaryEmployee> employees,
    @JsonKey(name: 'total_amount') final double? totalAmount,
  }) = _$SalaryPayloadImpl;

  factory _SalaryPayload.fromJson(Map<String, dynamic> json) =
      _$SalaryPayloadImpl.fromJson;

  @override
  String? get type;
  @override
  @JsonKey(name: 'date_range')
  Map<String, dynamic>? get dateRange;
  @override
  List<SalaryEmployee> get employees;
  @override
  @JsonKey(name: 'total_amount')
  double? get totalAmount;

  /// Create a copy of SalaryPayload
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SalaryPayloadImplCopyWith<_$SalaryPayloadImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SalaryEmployee _$SalaryEmployeeFromJson(Map<String, dynamic> json) {
  return _SalaryEmployee.fromJson(json);
}

/// @nodoc
mixin _$SalaryEmployee {
  @JsonKey(name: 'employee_id')
  int get employeeId => throw _privateConstructorUsedError;
  @JsonKey(name: 'employee_name')
  String get employeeName => throw _privateConstructorUsedError;
  String? get department => throw _privateConstructorUsedError;
  @JsonKey(name: 'base_salary')
  double? get baseSalary => throw _privateConstructorUsedError;
  @JsonKey(name: 'total_days')
  int? get totalDays => throw _privateConstructorUsedError;
  @JsonKey(name: 'total_salary')
  double? get totalSalary => throw _privateConstructorUsedError;
  @JsonKey(name: 'daily_records')
  List<SalaryRecord> get dailyRecords => throw _privateConstructorUsedError;

  /// Serializes this SalaryEmployee to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SalaryEmployee
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SalaryEmployeeCopyWith<SalaryEmployee> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SalaryEmployeeCopyWith<$Res> {
  factory $SalaryEmployeeCopyWith(
    SalaryEmployee value,
    $Res Function(SalaryEmployee) then,
  ) = _$SalaryEmployeeCopyWithImpl<$Res, SalaryEmployee>;
  @useResult
  $Res call({
    @JsonKey(name: 'employee_id') int employeeId,
    @JsonKey(name: 'employee_name') String employeeName,
    String? department,
    @JsonKey(name: 'base_salary') double? baseSalary,
    @JsonKey(name: 'total_days') int? totalDays,
    @JsonKey(name: 'total_salary') double? totalSalary,
    @JsonKey(name: 'daily_records') List<SalaryRecord> dailyRecords,
  });
}

/// @nodoc
class _$SalaryEmployeeCopyWithImpl<$Res, $Val extends SalaryEmployee>
    implements $SalaryEmployeeCopyWith<$Res> {
  _$SalaryEmployeeCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SalaryEmployee
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? employeeId = null,
    Object? employeeName = null,
    Object? department = freezed,
    Object? baseSalary = freezed,
    Object? totalDays = freezed,
    Object? totalSalary = freezed,
    Object? dailyRecords = null,
  }) {
    return _then(
      _value.copyWith(
            employeeId: null == employeeId
                ? _value.employeeId
                : employeeId // ignore: cast_nullable_to_non_nullable
                      as int,
            employeeName: null == employeeName
                ? _value.employeeName
                : employeeName // ignore: cast_nullable_to_non_nullable
                      as String,
            department: freezed == department
                ? _value.department
                : department // ignore: cast_nullable_to_non_nullable
                      as String?,
            baseSalary: freezed == baseSalary
                ? _value.baseSalary
                : baseSalary // ignore: cast_nullable_to_non_nullable
                      as double?,
            totalDays: freezed == totalDays
                ? _value.totalDays
                : totalDays // ignore: cast_nullable_to_non_nullable
                      as int?,
            totalSalary: freezed == totalSalary
                ? _value.totalSalary
                : totalSalary // ignore: cast_nullable_to_non_nullable
                      as double?,
            dailyRecords: null == dailyRecords
                ? _value.dailyRecords
                : dailyRecords // ignore: cast_nullable_to_non_nullable
                      as List<SalaryRecord>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SalaryEmployeeImplCopyWith<$Res>
    implements $SalaryEmployeeCopyWith<$Res> {
  factory _$$SalaryEmployeeImplCopyWith(
    _$SalaryEmployeeImpl value,
    $Res Function(_$SalaryEmployeeImpl) then,
  ) = __$$SalaryEmployeeImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'employee_id') int employeeId,
    @JsonKey(name: 'employee_name') String employeeName,
    String? department,
    @JsonKey(name: 'base_salary') double? baseSalary,
    @JsonKey(name: 'total_days') int? totalDays,
    @JsonKey(name: 'total_salary') double? totalSalary,
    @JsonKey(name: 'daily_records') List<SalaryRecord> dailyRecords,
  });
}

/// @nodoc
class __$$SalaryEmployeeImplCopyWithImpl<$Res>
    extends _$SalaryEmployeeCopyWithImpl<$Res, _$SalaryEmployeeImpl>
    implements _$$SalaryEmployeeImplCopyWith<$Res> {
  __$$SalaryEmployeeImplCopyWithImpl(
    _$SalaryEmployeeImpl _value,
    $Res Function(_$SalaryEmployeeImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SalaryEmployee
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? employeeId = null,
    Object? employeeName = null,
    Object? department = freezed,
    Object? baseSalary = freezed,
    Object? totalDays = freezed,
    Object? totalSalary = freezed,
    Object? dailyRecords = null,
  }) {
    return _then(
      _$SalaryEmployeeImpl(
        employeeId: null == employeeId
            ? _value.employeeId
            : employeeId // ignore: cast_nullable_to_non_nullable
                  as int,
        employeeName: null == employeeName
            ? _value.employeeName
            : employeeName // ignore: cast_nullable_to_non_nullable
                  as String,
        department: freezed == department
            ? _value.department
            : department // ignore: cast_nullable_to_non_nullable
                  as String?,
        baseSalary: freezed == baseSalary
            ? _value.baseSalary
            : baseSalary // ignore: cast_nullable_to_non_nullable
                  as double?,
        totalDays: freezed == totalDays
            ? _value.totalDays
            : totalDays // ignore: cast_nullable_to_non_nullable
                  as int?,
        totalSalary: freezed == totalSalary
            ? _value.totalSalary
            : totalSalary // ignore: cast_nullable_to_non_nullable
                  as double?,
        dailyRecords: null == dailyRecords
            ? _value._dailyRecords
            : dailyRecords // ignore: cast_nullable_to_non_nullable
                  as List<SalaryRecord>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SalaryEmployeeImpl implements _SalaryEmployee {
  const _$SalaryEmployeeImpl({
    @JsonKey(name: 'employee_id') required this.employeeId,
    @JsonKey(name: 'employee_name') required this.employeeName,
    this.department,
    @JsonKey(name: 'base_salary') this.baseSalary,
    @JsonKey(name: 'total_days') this.totalDays,
    @JsonKey(name: 'total_salary') this.totalSalary,
    @JsonKey(name: 'daily_records')
    final List<SalaryRecord> dailyRecords = const [],
  }) : _dailyRecords = dailyRecords;

  factory _$SalaryEmployeeImpl.fromJson(Map<String, dynamic> json) =>
      _$$SalaryEmployeeImplFromJson(json);

  @override
  @JsonKey(name: 'employee_id')
  final int employeeId;
  @override
  @JsonKey(name: 'employee_name')
  final String employeeName;
  @override
  final String? department;
  @override
  @JsonKey(name: 'base_salary')
  final double? baseSalary;
  @override
  @JsonKey(name: 'total_days')
  final int? totalDays;
  @override
  @JsonKey(name: 'total_salary')
  final double? totalSalary;
  final List<SalaryRecord> _dailyRecords;
  @override
  @JsonKey(name: 'daily_records')
  List<SalaryRecord> get dailyRecords {
    if (_dailyRecords is EqualUnmodifiableListView) return _dailyRecords;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_dailyRecords);
  }

  @override
  String toString() {
    return 'SalaryEmployee(employeeId: $employeeId, employeeName: $employeeName, department: $department, baseSalary: $baseSalary, totalDays: $totalDays, totalSalary: $totalSalary, dailyRecords: $dailyRecords)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SalaryEmployeeImpl &&
            (identical(other.employeeId, employeeId) ||
                other.employeeId == employeeId) &&
            (identical(other.employeeName, employeeName) ||
                other.employeeName == employeeName) &&
            (identical(other.department, department) ||
                other.department == department) &&
            (identical(other.baseSalary, baseSalary) ||
                other.baseSalary == baseSalary) &&
            (identical(other.totalDays, totalDays) ||
                other.totalDays == totalDays) &&
            (identical(other.totalSalary, totalSalary) ||
                other.totalSalary == totalSalary) &&
            const DeepCollectionEquality().equals(
              other._dailyRecords,
              _dailyRecords,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    employeeId,
    employeeName,
    department,
    baseSalary,
    totalDays,
    totalSalary,
    const DeepCollectionEquality().hash(_dailyRecords),
  );

  /// Create a copy of SalaryEmployee
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SalaryEmployeeImplCopyWith<_$SalaryEmployeeImpl> get copyWith =>
      __$$SalaryEmployeeImplCopyWithImpl<_$SalaryEmployeeImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SalaryEmployeeImplToJson(this);
  }
}

abstract class _SalaryEmployee implements SalaryEmployee {
  const factory _SalaryEmployee({
    @JsonKey(name: 'employee_id') required final int employeeId,
    @JsonKey(name: 'employee_name') required final String employeeName,
    final String? department,
    @JsonKey(name: 'base_salary') final double? baseSalary,
    @JsonKey(name: 'total_days') final int? totalDays,
    @JsonKey(name: 'total_salary') final double? totalSalary,
    @JsonKey(name: 'daily_records') final List<SalaryRecord> dailyRecords,
  }) = _$SalaryEmployeeImpl;

  factory _SalaryEmployee.fromJson(Map<String, dynamic> json) =
      _$SalaryEmployeeImpl.fromJson;

  @override
  @JsonKey(name: 'employee_id')
  int get employeeId;
  @override
  @JsonKey(name: 'employee_name')
  String get employeeName;
  @override
  String? get department;
  @override
  @JsonKey(name: 'base_salary')
  double? get baseSalary;
  @override
  @JsonKey(name: 'total_days')
  int? get totalDays;
  @override
  @JsonKey(name: 'total_salary')
  double? get totalSalary;
  @override
  @JsonKey(name: 'daily_records')
  List<SalaryRecord> get dailyRecords;

  /// Create a copy of SalaryEmployee
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SalaryEmployeeImplCopyWith<_$SalaryEmployeeImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SalaryRecord _$SalaryRecordFromJson(Map<String, dynamic> json) {
  return _SalaryRecord.fromJson(json);
}

/// @nodoc
mixin _$SalaryRecord {
  String get date => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_present')
  bool get isPresent => throw _privateConstructorUsedError;
  double get nominal => throw _privateConstructorUsedError;

  /// Serializes this SalaryRecord to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SalaryRecord
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SalaryRecordCopyWith<SalaryRecord> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SalaryRecordCopyWith<$Res> {
  factory $SalaryRecordCopyWith(
    SalaryRecord value,
    $Res Function(SalaryRecord) then,
  ) = _$SalaryRecordCopyWithImpl<$Res, SalaryRecord>;
  @useResult
  $Res call({
    String date,
    @JsonKey(name: 'is_present') bool isPresent,
    double nominal,
  });
}

/// @nodoc
class _$SalaryRecordCopyWithImpl<$Res, $Val extends SalaryRecord>
    implements $SalaryRecordCopyWith<$Res> {
  _$SalaryRecordCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SalaryRecord
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? date = null,
    Object? isPresent = null,
    Object? nominal = null,
  }) {
    return _then(
      _value.copyWith(
            date: null == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                      as String,
            isPresent: null == isPresent
                ? _value.isPresent
                : isPresent // ignore: cast_nullable_to_non_nullable
                      as bool,
            nominal: null == nominal
                ? _value.nominal
                : nominal // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SalaryRecordImplCopyWith<$Res>
    implements $SalaryRecordCopyWith<$Res> {
  factory _$$SalaryRecordImplCopyWith(
    _$SalaryRecordImpl value,
    $Res Function(_$SalaryRecordImpl) then,
  ) = __$$SalaryRecordImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String date,
    @JsonKey(name: 'is_present') bool isPresent,
    double nominal,
  });
}

/// @nodoc
class __$$SalaryRecordImplCopyWithImpl<$Res>
    extends _$SalaryRecordCopyWithImpl<$Res, _$SalaryRecordImpl>
    implements _$$SalaryRecordImplCopyWith<$Res> {
  __$$SalaryRecordImplCopyWithImpl(
    _$SalaryRecordImpl _value,
    $Res Function(_$SalaryRecordImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SalaryRecord
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? date = null,
    Object? isPresent = null,
    Object? nominal = null,
  }) {
    return _then(
      _$SalaryRecordImpl(
        date: null == date
            ? _value.date
            : date // ignore: cast_nullable_to_non_nullable
                  as String,
        isPresent: null == isPresent
            ? _value.isPresent
            : isPresent // ignore: cast_nullable_to_non_nullable
                  as bool,
        nominal: null == nominal
            ? _value.nominal
            : nominal // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SalaryRecordImpl implements _SalaryRecord {
  const _$SalaryRecordImpl({
    required this.date,
    @JsonKey(name: 'is_present') required this.isPresent,
    required this.nominal,
  });

  factory _$SalaryRecordImpl.fromJson(Map<String, dynamic> json) =>
      _$$SalaryRecordImplFromJson(json);

  @override
  final String date;
  @override
  @JsonKey(name: 'is_present')
  final bool isPresent;
  @override
  final double nominal;

  @override
  String toString() {
    return 'SalaryRecord(date: $date, isPresent: $isPresent, nominal: $nominal)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SalaryRecordImpl &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.isPresent, isPresent) ||
                other.isPresent == isPresent) &&
            (identical(other.nominal, nominal) || other.nominal == nominal));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, date, isPresent, nominal);

  /// Create a copy of SalaryRecord
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SalaryRecordImplCopyWith<_$SalaryRecordImpl> get copyWith =>
      __$$SalaryRecordImplCopyWithImpl<_$SalaryRecordImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SalaryRecordImplToJson(this);
  }
}

abstract class _SalaryRecord implements SalaryRecord {
  const factory _SalaryRecord({
    required final String date,
    @JsonKey(name: 'is_present') required final bool isPresent,
    required final double nominal,
  }) = _$SalaryRecordImpl;

  factory _SalaryRecord.fromJson(Map<String, dynamic> json) =
      _$SalaryRecordImpl.fromJson;

  @override
  String get date;
  @override
  @JsonKey(name: 'is_present')
  bool get isPresent;
  @override
  double get nominal;

  /// Create a copy of SalaryRecord
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SalaryRecordImplCopyWith<_$SalaryRecordImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
