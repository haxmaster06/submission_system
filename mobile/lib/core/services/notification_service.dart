import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/api_client.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationService(dio);
});

class NotificationService {
  final Dio _dio;
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  NotificationService(this._dio);

  bool _isRegistering = false;

  Future<void> initializeAndRequestToken() async {
    if (_isRegistering) return;
    _isRegistering = true;

    debugPrint('FCM: Starting initialization flow...');
    try {
      // 0. Initialize Local Notifications for foreground popups
      debugPrint('FCM: Initializing local notifications...');
      const AndroidInitializationSettings initializationSettingsAndroid =
          AndroidInitializationSettings('app_icon');
      const DarwinInitializationSettings initializationSettingsDarwin =
          DarwinInitializationSettings();
      const InitializationSettings initializationSettings =
          InitializationSettings(
            android: initializationSettingsAndroid,
            iOS: initializationSettingsDarwin,
          );

      await _localNotifications.initialize(
        settings: initializationSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          debugPrint('Notification clicked: ${response.payload}');
        },
      );
      // 1. Request permission (required for iOS and Android 13+)
      debugPrint('FCM: Requesting permissions...');
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        debugPrint(
          'FCM: Permissions granted (${settings.authorizationStatus})',
        );
        debugPrint(
          'FCM: Permissions granted (${settings.authorizationStatus})',
        );

        // 2. Fetch FCM Token
        debugPrint('FCM: Fetching token...');
        String? token = await _messaging.getToken();

        if (token != null) {
          debugPrint('FCM Token generated: $token');
          await _sendTokenToBackend(token);
        } else {
          debugPrint('FCM: Warning - Token is null');
        }

        // Listen to token refreshes
        _messaging.onTokenRefresh.listen((newToken) {
          debugPrint('FCM: Token refreshed: $newToken');
          _sendTokenToBackend(newToken);
        });
      } else {
        debugPrint(
          'FCM: Permissions declined status: ${settings.authorizationStatus}',
        );
        debugPrint(
          'FCM: Permissions declined status: ${settings.authorizationStatus}',
        );
      }
    } catch (e) {
      debugPrint('FCM: Error during initialization: $e');
    } finally {
      _isRegistering = false;
    }
  }

  Future<void> _sendTokenToBackend(String token, {int retry = 0}) async {
    try {
      debugPrint('FCM: Syncing token with backend... (Attempt ${retry + 1})');

      final response = await _dio.post(
        '/fcm/register',
        data: {
          'token': token,
          'device_type': defaultTargetPlatform == TargetPlatform.android
              ? 'android'
              : 'ios',
        },
      );

      debugPrint('FCM: Sync success! Response: ${response.statusCode}');
    } catch (e) {
      debugPrint('FCM: Sync failed: $e');

      // Retry once if it's a network error or potential race condition
      if (retry < 1 && e is DioException && e.response?.statusCode != 401) {
        debugPrint('FCM: Retrying in 2 seconds...');
        await Future.delayed(const Duration(seconds: 2));
        return _sendTokenToBackend(token, retry: retry + 1);
      }
    }
  }

  /// Unregister the current FCM token from backend (call before logout).
  Future<void> unregisterToken() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        debugPrint('FCM: Unregistering token from backend...');
        await _dio.post('/fcm/unregister', data: {'token': token});
        debugPrint('FCM: Token unregistered successfully.');
      }
    } catch (e) {
      debugPrint('FCM: Unregister failed (ignored): $e');
    }
  }

  Future<void> showForegroundNotification(RemoteMessage message) async {
    RemoteNotification? notification = message.notification;

    if (notification != null && !kIsWeb) {
      const AndroidNotificationDetails androidDetails =
          AndroidNotificationDetails(
            'high_importance_channel',
            'High Importance Notifications',
            importance: Importance.max,
            priority: Priority.high,
            showWhen: true,
          );

      const NotificationDetails platformDetails = NotificationDetails(
        android: androidDetails,
      );

      await _localNotifications.show(
        id: notification.hashCode,
        title: notification.title,
        body: notification.body,
        notificationDetails: platformDetails,
        payload: message.data.isNotEmpty
            ? message.data['submission_id']?.toString() ??
                  message.data['id']?.toString()
            : null,
      );
    }
  }
}

// Background Message Handler needs to be a top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("Handling a background message: ${message.messageId}");
}
