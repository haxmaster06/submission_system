import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

String? _readRoleName(Map<dynamic, dynamic> json, String key) {
  if (json['role'] != null) {
    return json['role']['name'] as String?;
  }
  return json['role_name'] as String?;
}

String? _readDivisionName(Map<dynamic, dynamic> json, String key) {
  if (json['division'] != null) {
    return json['division']['name'] as String?;
  }
  return json['division_name'] as String?;
}

@freezed
class User with _$User {
  const factory User({
    required int id,
    required String name,
    required String email,
    @JsonKey(name: 'role_id') int? roleId,
    @JsonKey(name: 'division_id') int? divisionId,
    @JsonKey(name: 'role_name', readValue: _readRoleName) String? roleName,
    @JsonKey(name: 'division_name', readValue: _readDivisionName)
    String? divisionName,
    @JsonKey(name: 'signature_path') String? signaturePath,
    @Default([]) List<Map<String, dynamic>> permissions,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

extension UserX on User {
  bool hasPermission(String permissionName) {
    return permissions.any((p) => p['name'] == permissionName);
  }

  bool get isSuperAdmin => roleName == 'Super Admin';
}
