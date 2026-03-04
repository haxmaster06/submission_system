// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'approval_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ApprovalItemImpl _$$ApprovalItemImplFromJson(Map<String, dynamic> json) =>
    _$ApprovalItemImpl(
      id: (json['id'] as num).toInt(),
      submissionId: (json['submission_id'] as num?)?.toInt(),
      roleId: (json['role_id'] as num?)?.toInt(),
      status: json['status'] as String,
      stepOrder: (json['step_order'] as num?)?.toInt(),
      approverId: (json['approver_id'] as num?)?.toInt(),
      notes: json['notes'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      roleName: _readStageRoleName(json, 'role_name') as String?,
      approverName: _readStageApproverName(json, 'approver_name') as String?,
      submission: json['submission'] == null
          ? null
          : Submission.fromJson(json['submission'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$ApprovalItemImplToJson(_$ApprovalItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'submission_id': instance.submissionId,
      'role_id': instance.roleId,
      'status': instance.status,
      'step_order': instance.stepOrder,
      'approver_id': instance.approverId,
      'notes': instance.notes,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'role_name': instance.roleName,
      'approver_name': instance.approverName,
      'submission': instance.submission,
    };
