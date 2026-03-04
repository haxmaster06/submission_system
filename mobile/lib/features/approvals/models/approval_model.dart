import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';

part 'approval_model.freezed.dart';
part 'approval_model.g.dart';

String? _readStageApproverName(Map<dynamic, dynamic> json, String key) {
  if (json['approver_name'] != null) return json['approver_name'] as String?;
  if (json['approver'] != null) return json['approver']['name'] as String?;
  return null;
}

String? _readStageRoleName(Map<dynamic, dynamic> json, String key) {
  if (json['role_name'] != null) return json['role_name'] as String?;
  if (json['role'] != null) return json['role']['name'] as String?;
  return null;
}

@freezed
class ApprovalItem with _$ApprovalItem {
  const factory ApprovalItem({
    required int id,
    @JsonKey(name: 'submission_id') int? submissionId,
    @JsonKey(name: 'role_id') int? roleId,
    required String status,
    @JsonKey(name: 'step_order') int? stepOrder,
    @JsonKey(name: 'approver_id') int? approverId,
    String? notes,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,

    // Mapped relations
    @JsonKey(name: 'role_name', readValue: _readStageRoleName) String? roleName,
    @JsonKey(name: 'approver_name', readValue: _readStageApproverName)
    String? approverName,
    Submission? submission,
  }) = _ApprovalItem;

  factory ApprovalItem.fromJson(Map<String, dynamic> json) =>
      _$ApprovalItemFromJson(json);
}
