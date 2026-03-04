import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/secure_storage.dart';
import 'package:mobile/features/auth/models/user_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthRepository(dio);
});

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  Future<User> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/login',
        data: {'email': email, 'password': password},
      );

      if (response.data['access_token'] != null) {
        final token = response.data['access_token'];
        if (token != null) {
          await SecureStorage.saveToken(token.toString());
        }

        final userData = Map<String, dynamic>.from(response.data['user']);
        if (userData['roles'] != null &&
            (userData['roles'] as List).isNotEmpty) {
          userData['role_id'] = userData['roles'][0]['id'];
          userData['role_name'] = userData['roles'][0]['name'];
        }

        return User.fromJson(userData);
      } else {
        throw Exception(response.data['message'] ?? 'Login gagal');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401 || e.response?.statusCode == 422) {
        throw Exception(
          e.response?.data['message'] ?? 'Email atau password salah',
        );
      }
      throw Exception(
        'Kesalahan server (${e.response?.statusCode}): ${e.message}',
      );
    } catch (e) {
      throw Exception('Gagal memproses login: $e');
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/logout');
    } catch (_) {
      // Ignore errors on logout (e.g., token already invalid)
    } finally {
      await SecureStorage.deleteToken();
    }
  }

  Future<User?> checkAuthStatus() async {
    final token = await SecureStorage.getToken();
    if (token == null) return null;

    try {
      final response = await _dio.get('/me');
      final userData = Map<String, dynamic>.from(response.data);
      if (userData['roles'] != null && (userData['roles'] as List).isNotEmpty) {
        userData['role_id'] = userData['roles'][0]['id'];
        userData['role_name'] = userData['roles'][0]['name'];
      }
      return User.fromJson(userData);
    } catch (e) {
      // Token is invalid or expired
      await SecureStorage.deleteToken();
      return null;
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  }) async {
    try {
      await _dio.put(
        '/me/password',
        data: {
          'current_password': currentPassword,
          'password': newPassword,
          'password_confirmation': newPasswordConfirmation,
        },
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == 422) {
        throw Exception(e.response?.data['message'] ?? 'Validasi gagal');
      }
      throw Exception('Gagal ganti password: ${e.message}');
    }
  }
}
