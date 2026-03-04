// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  email: json['email'] as String,
  roleId: (json['role_id'] as num?)?.toInt(),
  divisionId: (json['division_id'] as num?)?.toInt(),
  roleName: _readRoleName(json, 'role_name') as String?,
  divisionName: _readDivisionName(json, 'division_name') as String?,
  signaturePath: json['signature_path'] as String?,
  permissions:
      (json['permissions'] as List<dynamic>?)
          ?.map((e) => e as Map<String, dynamic>)
          .toList() ??
      const [],
);

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'role_id': instance.roleId,
      'division_id': instance.divisionId,
      'role_name': instance.roleName,
      'division_name': instance.divisionName,
      'signature_path': instance.signaturePath,
      'permissions': instance.permissions,
    };
