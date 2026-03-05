import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/features/approvals/models/approval_model.dart';

final approvalRepositoryProvider = Provider<ApprovalRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return ApprovalRepository(dio);
});

class ApprovalRepository {
  final Dio _dio;
  ApprovalRepository(this._dio);

  Future<List<ApprovalItem>> getPendingApprovals({int page = 1}) async {
    final response = await _dio.get(
      '/approvals/pending',
      queryParameters: {'page': page},
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => ApprovalItem.fromJson(e)).toList();
    } else {
      throw Exception('Gagal memuat persetujuan tertunda');
    }
  }

  Future<List<ApprovalItem>> getHistoryApprovals({int page = 1}) async {
    final response = await _dio.get(
      '/approvals/history',
      queryParameters: {'page': page},
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => ApprovalItem.fromJson(e)).toList();
    } else {
      throw Exception('Gagal memuat riwayat persetujuan');
    }
  }

  Future<void> approveSubmission(
    int approvalId, {
    String? notes,
    String? signaturePath,
    bool isDirectorProxy = false,
    String? signedProofPath,
  }) async {
    final response = await _dio.post(
      '/approvals/$approvalId/approve',
      data: {
        if (notes != null) 'notes': notes,
        if (signaturePath != null) 'signature_path': signaturePath,
        'is_director_proxy': isDirectorProxy,
        if (signedProofPath != null) 'signed_proof_path': signedProofPath,
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Gagal menyetujui pengajuan');
    }
  }

  Future<void> rejectSubmission(int approvalId, String notes) async {
    final response = await _dio.post(
      '/approvals/$approvalId/reject',
      data: {'notes': notes},
    );
    if (response.statusCode != 200) {
      throw Exception('Gagal menolak pengajuan');
    }
  }

  Future<void> holdSubmission(int approvalId, String notes) async {
    final response = await _dio.post(
      '/approvals/$approvalId/hold',
      data: {'notes': notes},
    );
    if (response.statusCode != 200) {
      throw Exception('Gagal menunda pengajuan');
    }
  }
}
