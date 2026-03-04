import 'package:freezed_annotation/freezed_annotation.dart';

part 'submission_model.freezed.dart';
part 'submission_model.g.dart';

String _readSubmissionType(Map<dynamic, dynamic> json, String key) {
  if (json['type'] != null) return json['type'].toString();
  if (json['jenis_pengajuan'] != null) {
    if (json['jenis_pengajuan'] is Map) {
      return json['jenis_pengajuan']['name']?.toString() ?? 'Unknown';
    }
    return json['jenis_pengajuan'].toString();
  }
  return json['description']?.toString() ?? 'Unknown';
}

String _readSubmissionStatus(Map<dynamic, dynamic> json, String key) {
  if (json['status'] != null) return json['status'].toString();
  return json['final_status']?.toString() ?? 'pending';
}

bool _readSubmissionIsUrgent(Map<dynamic, dynamic> json, String key) {
  if (json['is_urgent'] != null) {
    final val = json['is_urgent'];
    if (val is bool) return val;
    if (val is int) return val == 1;
    return val.toString() == 'true' || val.toString() == '1';
  }
  if (json['status_urgent'] != null) return json['status_urgent'] != 'NRM';
  return false;
}

String _readSubmissionNotes(Map<dynamic, dynamic> json, String key) {
  return json['notes']?.toString() ?? '';
}

List<dynamic> _readSubmissionDetails(Map<dynamic, dynamic> json, String key) {
  if (json['details'] != null && json['details'] is List)
    return json['details'] as List<dynamic>;
  if (json['items'] != null && json['items'] is List)
    return json['items'] as List<dynamic>;
  return [];
}

String? _readUserName(Map<dynamic, dynamic> json, String key) {
  if (json['user_name'] != null) return json['user_name'].toString();
  if (json['user'] != null && json['user'] is Map)
    return json['user']['name']?.toString();
  return null;
}

String? _readDivisionName(Map<dynamic, dynamic> json, String key) {
  if (json['division_name'] != null) return json['division_name'].toString();
  if (json['division'] != null && json['division'] is Map)
    return json['division']['name']?.toString();
  return null;
}

List<dynamic> _readApprovalStages(Map<dynamic, dynamic> json, String key) {
  if (json['approval_stages'] != null && json['approval_stages'] is List)
    return json['approval_stages'] as List<dynamic>;
  if (json['approvals'] != null && json['approvals'] is List)
    return json['approvals'] as List<dynamic>;
  return [];
}

double _readSubmissionTotal(Map<dynamic, dynamic> json, String key) {
  if (json['total'] != null) {
    return double.tryParse(json['total'].toString()) ?? 0.0;
  }
  return 0.0;
}

@freezed
class Submission with _$Submission {
  const factory Submission({
    required int id,
    @JsonKey(name: 'user_id') required int userId,
    @JsonKey(name: 'division_id') required int divisionId,
    @JsonKey(readValue: _readSubmissionType) required String type,
    @JsonKey(readValue: _readSubmissionNotes) required String notes,
    @JsonKey(readValue: _readSubmissionStatus) required String status,
    @JsonKey(name: 'is_urgent', readValue: _readSubmissionIsUrgent)
    required bool isUrgent,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(readValue: _readSubmissionTotal) @Default(0.0) double total,
    @JsonKey(name: 'current_approval_step')
    @Default(1)
    int current_approval_step,
    @JsonKey(name: 'current_step_role') String? current_step_role,

    // Relations that might come with the list/detail
    String? description,
    @JsonKey(name: 'user_name', readValue: _readUserName) String? user_name,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    String? division_name,
    @JsonKey(readValue: _readSubmissionDetails)
    @Default([])
    List<SubmissionDetail> details,
    @JsonKey(name: 'approval_stages', readValue: _readApprovalStages)
    @Default([])
    List<ApprovalStage> approval_stages,
    @Default([]) List<Attachment> attachments,
    @Default([]) List<AttachmentRequestModel> attachmentRequests,
    Map<String, dynamic>? payload,
  }) = _Submission;

  factory Submission.fromJson(Map<String, dynamic> json) =>
      _$SubmissionFromJson(json);
}

double _readDetailAmount(Map<dynamic, dynamic> json, String key) {
  if (json['amount'] != null)
    return double.tryParse(json['amount'].toString()) ?? 0.0;
  if (json['total'] != null)
    return double.tryParse(json['total'].toString()) ?? 0.0;
  if (json['nominal'] != null)
    return double.tryParse(json['nominal'].toString()) ?? 0.0;
  return 0.0;
}

String _readDetailDescription(Map<dynamic, dynamic> json, String key) {
  return json['description']?.toString() ?? '';
}

@freezed
class SubmissionDetail with _$SubmissionDetail {
  const factory SubmissionDetail({
    required int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(readValue: _readDetailDescription) required String description,
    @JsonKey(readValue: _readDetailAmount) required double amount,
    String? receipt_path,
  }) = _SubmissionDetail;

  factory SubmissionDetail.fromJson(Map<String, dynamic> json) =>
      _$SubmissionDetailFromJson(json);
}

String? _readStageApproverName(Map<dynamic, dynamic> json, String key) {
  if (json['approver_name'] != null) return json['approver_name'].toString();
  if (json['approver'] != null && json['approver'] is Map)
    return json['approver']['name']?.toString();
  return null;
}

String? _readStageRoleName(Map<dynamic, dynamic> json, String key) {
  if (json['role_name'] != null) return json['role_name'].toString();
  if (json['role'] != null && json['role'] is Map)
    return json['role']['name']?.toString();
  return null;
}

String _readStageStatus(Map<dynamic, dynamic> json, String key) {
  return json['status']?.toString() ?? 'pending';
}

@freezed
class ApprovalStage with _$ApprovalStage {
  const factory ApprovalStage({
    required int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'role_id') int? roleId,
    @JsonKey(readValue: _readStageStatus) required String status,
    @JsonKey(name: 'step_order') int? step_order,
    int? approver_id,
    String? notes,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,

    // Mapped relations
    @JsonKey(name: 'role_name', readValue: _readStageRoleName)
    String? role_name,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    String? approver_name,
  }) = _ApprovalStage;

  factory ApprovalStage.fromJson(Map<String, dynamic> json) =>
      _$ApprovalStageFromJson(json);
}

String _readAttachmentPath(Map<dynamic, dynamic> json, String key) {
  return json['file_path']?.toString() ?? '';
}

String _readAttachmentType(Map<dynamic, dynamic> json, String key) {
  return json['file_type']?.toString() ?? 'unknown';
}

String _readAttachmentName(Map<dynamic, dynamic> json, String key) {
  return json['original_name']?.toString() ?? 'file';
}

@freezed
class Attachment with _$Attachment {
  const factory Attachment({
    required int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'file_path', readValue: _readAttachmentPath)
    required String filePath,
    @JsonKey(name: 'file_type', readValue: _readAttachmentType)
    required String fileType,
    @JsonKey(name: 'original_name', readValue: _readAttachmentName)
    required String originalName,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _Attachment;

  factory Attachment.fromJson(Map<String, dynamic> json) =>
      _$AttachmentFromJson(json);
}

@freezed
class AttachmentRequestModel with _$AttachmentRequestModel {
  const factory AttachmentRequestModel({
    required int id,
    @JsonKey(name: 'submission_id') required int submissionId,
    @JsonKey(name: 'requested_by') required int requestedBy,
    @JsonKey(name: 'target_user_id') required int targetUserId,
    @JsonKey(name: 'file_description') required String fileDescription,
    required String status,
    @JsonKey(name: 'attachment_id') int? attachmentId,
    @JsonKey(name: 'created_at') DateTime? createdAt,

    // Relations
    String? requester_name,
    String? target_user_name,
  }) = _AttachmentRequestModel;

  factory AttachmentRequestModel.fromJson(Map<String, dynamic> json) =>
      _$AttachmentRequestModelFromJson(json);
}

@freezed
class UserSelectable with _$UserSelectable {
  const factory UserSelectable({
    required int id,
    required String name,
    @JsonKey(name: 'division_name') String? divisionName,
  }) = _UserSelectable;

  factory UserSelectable.fromJson(Map<String, dynamic> json) =>
      _$UserSelectableFromJson(json);
}

@freezed
class SalaryPayload with _$SalaryPayload {
  const factory SalaryPayload({
    String? type,
    @JsonKey(name: 'date_range') Map<String, dynamic>? dateRange,
    @Default([]) List<SalaryEmployee> employees,
    @JsonKey(name: 'total_amount') double? totalAmount,
  }) = _SalaryPayload;

  factory SalaryPayload.fromJson(Map<String, dynamic> json) =>
      _$SalaryPayloadFromJson(json);
}

@freezed
class SalaryEmployee with _$SalaryEmployee {
  const factory SalaryEmployee({
    @JsonKey(name: 'employee_id') required int employeeId,
    @JsonKey(name: 'employee_name') required String employeeName,
    String? department,
    @JsonKey(name: 'base_salary') double? baseSalary,
    @JsonKey(name: 'total_days') int? totalDays,
    @JsonKey(name: 'total_salary') double? totalSalary,
    @JsonKey(name: 'daily_records')
    @Default([])
    List<SalaryRecord> dailyRecords,
  }) = _SalaryEmployee;

  factory SalaryEmployee.fromJson(Map<String, dynamic> json) =>
      _$SalaryEmployeeFromJson(json);
}

@freezed
class SalaryRecord with _$SalaryRecord {
  const factory SalaryRecord({
    required String date,
    @JsonKey(name: 'is_present') required bool isPresent,
    required double nominal,
  }) = _SalaryRecord;

  factory SalaryRecord.fromJson(Map<String, dynamic> json) =>
      _$SalaryRecordFromJson(json);
}
