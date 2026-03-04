import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/api_client.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return DashboardRepository(dio);
});

class DashboardRepository {
  final Dio _dio;

  DashboardRepository(this._dio);

  Future<Map<String, dynamic>> fetchDashboardSummary() async {
    final response = await _dio.get('/dashboard/stats');
    if (response.statusCode == 200) {
      return response.data as Map<String, dynamic>;
    } else {
      throw Exception('Gagal memuat ringkasan dashboard');
    }
  }

  Future<Map<String, dynamic>> fetchAdminStats() async {
    final response = await _dio.get('/admin/dashboard-stats');
    if (response.statusCode == 200) {
      return response.data as Map<String, dynamic>;
    } else {
      throw Exception('Gagal memuat statistik admin');
    }
  }
}
