import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';

final submissionRepositoryProvider = Provider<SubmissionRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return SubmissionRepository(dio);
});

class SubmissionRepository {
  final Dio _dio;

  SubmissionRepository(this._dio);

  Future<List<Submission>> getSubmissions({
    int page = 1,
    String? type,
    String? status,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      if (type != null) 'type': type,
      if (status != null) 'status': status,
    };

    final response = await _dio.get(
      '/submissions',
      queryParameters: queryParams,
    );

    if (response.statusCode == 200) {
      final List data =
          response.data['submissions']['data']; // Laravel pagination structure
      return data.map((e) => Submission.fromJson(e)).toList();
    } else {
      throw Exception('Gagal memuat daftar pengajuan');
    }
  }

  Future<Submission> getSubmission(int id) async {
    final response = await _dio.get('/submissions/$id');

    if (response.statusCode == 200) {
      return Submission.fromJson(response.data);
    } else {
      throw Exception('Gagal memuat rincian pengajuan');
    }
  }

  Future<int> createSubmission({
    required int divisionId,
    required int jenisPengajuanId,
    required String statusUrgent,
    required String description,
    String? notes,
    List<Map<String, dynamic>>? items,
    Map<String, dynamic>? payload,
    double? total,
    bool isDraft = false,
  }) async {
    final response = await _dio.post(
      '/submissions',
      data: {
        'division_id': divisionId,
        'jenis_pengajuan_id': jenisPengajuanId,
        'status_urgent': statusUrgent,
        'description': description,
        'is_draft': isDraft,
        if (notes != null) 'notes': notes,
        if (items != null) 'items': items,
        if (payload != null) 'payload': payload,
        if (total != null) 'total': total,
      },
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return response
          .data['id']; // Return Submission ID for subsequent attachment upload
    } else {
      throw Exception('Gagal membuat pengajuan baru');
    }
  }

  Future<void> updateSubmission(
    int id, {
    required int divisionId,
    required int jenisPengajuanId,
    required String statusUrgent,
    required String description,
    String? notes,
    List<Map<String, dynamic>>? items,
    Map<String, dynamic>? payload,
    double? total,
  }) async {
    final response = await _dio.put(
      '/submissions/$id',
      data: {
        'division_id': divisionId,
        'jenis_pengajuan_id': jenisPengajuanId,
        'status_urgent': statusUrgent,
        'description': description,
        if (notes != null) 'notes': notes,
        if (items != null) 'items': items,
        if (payload != null) 'payload': payload,
        if (total != null) 'total': total,
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal memperbarui draf pengajuan');
    }
  }

  Future<void> publishSubmission(int id) async {
    final response = await _dio.post('/submissions/$id/publish');

    if (response.statusCode != 200) {
      throw Exception('Gagal menerbitkan pengajuan');
    }
  }

  Future<void> deleteSubmission(int id) async {
    final response = await _dio.delete('/submissions/$id');

    if (response.statusCode != 200) {
      throw Exception('Gagal menghapus pengajuan');
    }
  }

  Future<void> attachFiles(int submissionId, FormData formData) async {
    final response = await _dio.post(
      '/submissions/$submissionId/attachments',
      data: formData,
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Gagal mengunggah lampiran');
    }
  }

  Future<void> approveSubmission(int id, String status, String? notes) async {
    final response = await _dio.post(
      '/submissions/$id/approve',
      data: {'status': status, if (notes != null) 'notes': notes},
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal memproses persetujuan');
    }
  }

  // Attachment Requests
  Future<List<Map<String, dynamic>>> fetchSelectableUsers() async {
    final response = await _dio.get('/users/selectable');
    if (response.statusCode == 200) {
      return List<Map<String, dynamic>>.from(response.data);
    } else {
      throw Exception('Gagal memuat daftar user');
    }
  }

  Future<void> requestAttachment({
    required int submissionId,
    required int targetUserId,
    required String fileDescription,
  }) async {
    final response = await _dio.post(
      '/attachment-requests',
      data: {
        'submission_id': submissionId,
        'target_user_id': targetUserId,
        'file_description': fileDescription,
      },
    );

    if (response.statusCode != 201) {
      throw Exception('Gagal mengirim permintaan lampiran');
    }
  }

  Future<List<dynamic>> getMyAttachmentRequests() async {
    final response = await _dio.get('/attachment-requests/my');
    if (response.statusCode == 200) {
      return response.data['data'];
    } else {
      throw Exception('Gagal memuat permintaan lampiran');
    }
  }

  Future<void> fulfillAttachmentRequest(
    int requestId,
    FormData formData,
  ) async {
    final response = await _dio.post(
      '/attachment-requests/$requestId/fulfill',
      data: formData,
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal memenuhi permintaan lampiran');
    }
  }
}
