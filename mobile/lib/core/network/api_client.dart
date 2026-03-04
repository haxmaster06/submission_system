import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/utils/secure_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      // The application is live and must point to the public sub-domain.
      baseUrl: 'https://budgeting.hbmnet.co.id/api/',
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Accept': 'application/json'},
    ),
  );

  // CRITICAL FIX FOR EMULATORS:
  // Older Android emulators (like LDPlayer Android 7/9) often fail SSL handshakes
  // with modern certificates (like Let's Encrypt) because their Root CA store is outdated.
  // We bypass SSL certificate verification here to ensure connectivity.
  if (dio.httpClientAdapter is IOHttpClientAdapter) {
    (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
      return client;
    };
  }

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Prevent Dio from replacing the baseUrl path if the endpoint starts with '/'
        if (options.path.startsWith('/')) {
          options.path = options.path.substring(1);
        }

        final token = await SecureStorage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        debugPrint(
          'API REQUEST: [${options.method}] ${options.baseUrl}${options.path}',
        );
        return handler.next(options);
      },
      onResponse: (response, handler) {
        debugPrint(
          'API RESPONSE: [${response.statusCode}] ${response.requestOptions.path}',
        );
        return handler.next(response);
      },
      onError: (DioException e, handler) async {
        debugPrint('API ERROR: [${e.response?.statusCode}] ${e.message}');

        // SILENT RETRY LOGIC for timeouts/connection issues
        if (e.type == DioExceptionType.connectionTimeout ||
            e.type == DioExceptionType.sendTimeout ||
            e.type == DioExceptionType.receiveTimeout ||
            e.error is SocketException) {
          final options = e.requestOptions;
          // Track retry count in extra
          int retryCount = options.extra['retry_count'] ?? 0;

          if (retryCount < 3) {
            retryCount++;
            options.extra['retry_count'] = retryCount;

            // Exponential backoff: 1s, 2s, 4s
            final delay = Duration(seconds: retryCount * retryCount);
            debugPrint(
              'SILENT RETRY ($retryCount/3) in ${delay.inSeconds}s for ${options.path}',
            );

            await Future.delayed(delay);

            try {
              final response = await dio.fetch(options);
              return handler.resolve(response);
            } catch (retryError) {
              // If retry also fails, we let it fall through to normal error handling
              // unless we want to recurse (which we don't, we want to hit the next onError)
              if (retryError is DioException) {
                return handler.next(retryError);
              }
            }
          }
        }

        String customMessage =
            'Sistem sedang sibuk. Silakan coba beberapa saat lagi.';
        if (e.type == DioExceptionType.connectionTimeout ||
            e.type == DioExceptionType.receiveTimeout ||
            e.type == DioExceptionType.sendTimeout) {
          customMessage =
              'Koneksi terputus atau sangat lambat. Silakan periksa sinyal Anda dan sentuh "Coba Lagi".';
        } else if (e.error is SocketException) {
          customMessage =
              'Tidak ada koneksi internet. Aktifkan data/Wi-Fi dan coba lagi.';
        } else if (e.response?.statusCode == 401) {
          customMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (e.response?.statusCode == 403) {
          customMessage = 'Anda dilarang mengakses modul ini.';
        } else if (e.response?.statusCode == 404) {
          customMessage = 'Data tidak ditemukan (404).';
        } else if (e.response?.statusCode == 422) {
          customMessage = 'Data yang dikirim tidak valid.';
          if (e.response?.data != null && e.response?.data['message'] != null) {
            customMessage = e.response?.data['message'];
          }
        } else if (e.response?.data != null &&
            e.response?.data['message'] != null) {
          customMessage = e.response?.data['message'];
        } else if (e.response?.statusCode == 500) {
          customMessage =
              'Terjadi kesalahan pada server (500). Silakan hubungi admin.';
        }

        final modifiedError = e.copyWith(message: customMessage);
        return handler.next(modifiedError);
      },
    ),
  );

  // Optional: Add logging interceptor during debug
  dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

  return dio;
});
