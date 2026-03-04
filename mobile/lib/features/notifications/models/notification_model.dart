import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_model.freezed.dart';

@freezed
class NotificationModel with _$NotificationModel {
  const factory NotificationModel({
    required String id,
    required String title,
    required String message,
    required DateTime createdAt,
    DateTime? readAt,
    Map<String, dynamic>? data,
  }) = _NotificationModel;

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    // If it's a Laravel database notification, fields might be inside 'data'
    final Map<String, dynamic> dataMap = json['data'] is Map
        ? Map<String, dynamic>.from(json['data'])
        : {};

    return NotificationModel(
      id: json['id']?.toString() ?? '',
      title:
          json['title']?.toString() ??
          dataMap['title']?.toString() ??
          'Pemberitahuan',
      message:
          dataMap['message']?.toString() ??
          dataMap['body']?.toString() ??
          json['message']?.toString() ??
          json['body']?.toString() ??
          '',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'].toString())
          : DateTime.now(),
      readAt: json['read_at'] != null
          ? DateTime.parse(json['read_at'].toString())
          : null,
      data: dataMap,
    );
  }
}

extension NotificationModelX on NotificationModel {
  bool get isRead => readAt != null;
}
