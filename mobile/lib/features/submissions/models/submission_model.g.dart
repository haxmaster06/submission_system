// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'submission_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SubmissionImpl _$$SubmissionImplFromJson(Map<String, dynamic> json) =>
    _$SubmissionImpl(
      id: (json['id'] as num).toInt(),
      userId: (json['user_id'] as num).toInt(),
      divisionId: (json['division_id'] as num).toInt(),
      type: _readSubmissionType(json, 'type') as String,
      notes: _readSubmissionNotes(json, 'notes') as String,
      status: _readSubmissionStatus(json, 'status') as String,
      isUrgent: _readSubmissionIsUrgent(json, 'is_urgent') as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      total: (_readSubmissionTotal(json, 'total') as num?)?.toDouble() ?? 0.0,
      current_approval_step:
          (json['current_approval_step'] as num?)?.toInt() ?? 1,
      current_step_role: json['current_step_role'] as String?,
      description: json['description'] as String?,
      user_name: _readUserName(json, 'user_name') as String?,
      division_name: _readDivisionName(json, 'division_name') as String?,
      details:
          (_readSubmissionDetails(json, 'details') as List<dynamic>?)
              ?.map((e) => SubmissionDetail.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      approval_stages:
          (_readApprovalStages(json, 'approval_stages') as List<dynamic>?)
              ?.map((e) => ApprovalStage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      attachments:
          (json['attachments'] as List<dynamic>?)
              ?.map((e) => Attachment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      attachmentRequests:
          (json['attachmentRequests'] as List<dynamic>?)
              ?.map(
                (e) =>
                    AttachmentRequestModel.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
      payload: json['payload'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$SubmissionImplToJson(_$SubmissionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'division_id': instance.divisionId,
      'type': instance.type,
      'notes': instance.notes,
      'status': instance.status,
      'is_urgent': instance.isUrgent,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'total': instance.total,
      'current_approval_step': instance.current_approval_step,
      'current_step_role': instance.current_step_role,
      'description': instance.description,
      'user_name': instance.user_name,
      'division_name': instance.division_name,
      'details': instance.details,
      'approval_stages': instance.approval_stages,
      'attachments': instance.attachments,
      'attachmentRequests': instance.attachmentRequests,
      'payload': instance.payload,
    };

_$SubmissionDetailImpl _$$SubmissionDetailImplFromJson(
  Map<String, dynamic> json,
) => _$SubmissionDetailImpl(
  id: (json['id'] as num).toInt(),
  submissionId: (json['submission_id'] as num?)?.toInt(),
  description: _readDetailDescription(json, 'description') as String,
  amount: (_readDetailAmount(json, 'amount') as num).toDouble(),
  receipt_path: json['receipt_path'] as String?,
);

Map<String, dynamic> _$$SubmissionDetailImplToJson(
  _$SubmissionDetailImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'submission_id': instance.submissionId,
  'description': instance.description,
  'amount': instance.amount,
  'receipt_path': instance.receipt_path,
};

_$ApprovalStageImpl _$$ApprovalStageImplFromJson(Map<String, dynamic> json) =>
    _$ApprovalStageImpl(
      id: (json['id'] as num).toInt(),
      submissionId: (json['submission_id'] as num?)?.toInt(),
      roleId: (json['role_id'] as num?)?.toInt(),
      status: _readStageStatus(json, 'status') as String,
      step_order: (json['step_order'] as num?)?.toInt(),
      approver_id: (json['approver_id'] as num?)?.toInt(),
      notes: json['notes'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      role_name: _readStageRoleName(json, 'role_name') as String?,
      approver_name: _readStageApproverName(json, 'approver_name') as String?,
    );

Map<String, dynamic> _$$ApprovalStageImplToJson(_$ApprovalStageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'submission_id': instance.submissionId,
      'role_id': instance.roleId,
      'status': instance.status,
      'step_order': instance.step_order,
      'approver_id': instance.approver_id,
      'notes': instance.notes,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'role_name': instance.role_name,
      'approver_name': instance.approver_name,
    };

_$AttachmentImpl _$$AttachmentImplFromJson(Map<String, dynamic> json) =>
    _$AttachmentImpl(
      id: (json['id'] as num).toInt(),
      submissionId: (json['submission_id'] as num?)?.toInt(),
      filePath: _readAttachmentPath(json, 'file_path') as String,
      fileType: _readAttachmentType(json, 'file_type') as String,
      originalName: _readAttachmentName(json, 'original_name') as String,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$$AttachmentImplToJson(_$AttachmentImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'submission_id': instance.submissionId,
      'file_path': instance.filePath,
      'file_type': instance.fileType,
      'original_name': instance.originalName,
      'created_at': instance.createdAt?.toIso8601String(),
    };

_$AttachmentRequestModelImpl _$$AttachmentRequestModelImplFromJson(
  Map<String, dynamic> json,
) => _$AttachmentRequestModelImpl(
  id: (json['id'] as num).toInt(),
  submissionId: (json['submission_id'] as num).toInt(),
  requestedBy: (json['requested_by'] as num).toInt(),
  targetUserId: (json['target_user_id'] as num).toInt(),
  fileDescription: json['file_description'] as String,
  status: json['status'] as String,
  attachmentId: (json['attachment_id'] as num?)?.toInt(),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  requester_name: json['requester_name'] as String?,
  target_user_name: json['target_user_name'] as String?,
);

Map<String, dynamic> _$$AttachmentRequestModelImplToJson(
  _$AttachmentRequestModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'submission_id': instance.submissionId,
  'requested_by': instance.requestedBy,
  'target_user_id': instance.targetUserId,
  'file_description': instance.fileDescription,
  'status': instance.status,
  'attachment_id': instance.attachmentId,
  'created_at': instance.createdAt?.toIso8601String(),
  'requester_name': instance.requester_name,
  'target_user_name': instance.target_user_name,
};

_$UserSelectableImpl _$$UserSelectableImplFromJson(Map<String, dynamic> json) =>
    _$UserSelectableImpl(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      divisionName: json['division_name'] as String?,
    );

Map<String, dynamic> _$$UserSelectableImplToJson(
  _$UserSelectableImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'division_name': instance.divisionName,
};

_$SalaryPayloadImpl _$$SalaryPayloadImplFromJson(Map<String, dynamic> json) =>
    _$SalaryPayloadImpl(
      type: json['type'] as String?,
      dateRange: json['date_range'] as Map<String, dynamic>?,
      employees:
          (json['employees'] as List<dynamic>?)
              ?.map((e) => SalaryEmployee.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      totalAmount: (json['total_amount'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$$SalaryPayloadImplToJson(_$SalaryPayloadImpl instance) =>
    <String, dynamic>{
      'type': instance.type,
      'date_range': instance.dateRange,
      'employees': instance.employees,
      'total_amount': instance.totalAmount,
    };

_$SalaryEmployeeImpl _$$SalaryEmployeeImplFromJson(Map<String, dynamic> json) =>
    _$SalaryEmployeeImpl(
      employeeId: (json['employee_id'] as num).toInt(),
      employeeName: json['employee_name'] as String,
      department: json['department'] as String?,
      baseSalary: (json['base_salary'] as num?)?.toDouble(),
      totalDays: (json['total_days'] as num?)?.toInt(),
      totalSalary: (json['total_salary'] as num?)?.toDouble(),
      dailyRecords:
          (json['daily_records'] as List<dynamic>?)
              ?.map((e) => SalaryRecord.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$SalaryEmployeeImplToJson(
  _$SalaryEmployeeImpl instance,
) => <String, dynamic>{
  'employee_id': instance.employeeId,
  'employee_name': instance.employeeName,
  'department': instance.department,
  'base_salary': instance.baseSalary,
  'total_days': instance.totalDays,
  'total_salary': instance.totalSalary,
  'daily_records': instance.dailyRecords,
};

_$SalaryRecordImpl _$$SalaryRecordImplFromJson(Map<String, dynamic> json) =>
    _$SalaryRecordImpl(
      date: json['date'] as String,
      isPresent: json['is_present'] as bool,
      nominal: (json['nominal'] as num).toDouble(),
    );

Map<String, dynamic> _$$SalaryRecordImplToJson(_$SalaryRecordImpl instance) =>
    <String, dynamic>{
      'date': instance.date,
      'is_present': instance.isPresent,
      'nominal': instance.nominal,
    };
