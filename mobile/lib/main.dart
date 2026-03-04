import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mobile/core/config/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/services/notification_service.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/core/config/firebase_options.dart';

void main() async {
  try {
    WidgetsFlutterBinding.ensureInitialized();

    // Lock orientation to portrait only
    await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

    debugPrint('Device initialized. Starting Firebase...');

    bool isFirebaseReady = false;
    if (Firebase.apps.isEmpty) {
      try {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
        debugPrint('Firebase initialized successfully.');
        isFirebaseReady = true;
      } catch (e) {
        debugPrint('Firebase warning (will safely continue without push): $e');
      }
    } else {
      isFirebaseReady = true;
    }

    if (isFirebaseReady) {
      try {
        FirebaseMessaging.onBackgroundMessage(
          firebaseMessagingBackgroundHandler,
        );
        debugPrint('FCM Background handler set.');
      } catch (e) {
        debugPrint('FCM Handler warning: $e');
      }
    }

    runApp(const ProviderScope(child: HBMApp()));
  } catch (e, stack) {
    debugPrint('CRITICAL INITIALIZATION ERROR: $e');
    debugPrint('Stacktrace: $stack');

    // Fallback UI in case of failure before runApp
    runApp(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Text(
                'Gagal Memuat Aplikasi:\n$e',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HBMApp extends ConsumerStatefulWidget {
  const HBMApp({super.key});

  @override
  ConsumerState<HBMApp> createState() => _HBMAppState();
}

class _HBMAppState extends ConsumerState<HBMApp> {
  @override
  void initState() {
    super.initState();
    // Foreground Message Listener
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Got a message whilst in the foreground!');
      debugPrint('Message data: ${message.data}');

      ref.read(notificationServiceProvider).showForegroundNotification(message);

      if (message.notification != null) {
        debugPrint(
          'Message also contained a notification: ${message.notification}',
        );
      }
    });

    // Handle interaction when app is in background but opened via notification
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('A new onMessageOpenedApp event was published!');
      // navigation logic handled by router or manually if needed
    });

    // Check initial auth state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // _registerIfAuthenticated(ref.read(authProvider)); // Moved to DashboardScreen
    });
  }

  @override
  Widget build(BuildContext context) {
    // Watch auth state to register FCM token only after login
    ref.listen(authProvider, (previous, next) {
      // _registerIfAuthenticated(next); // Moved to DashboardScreen
    });

    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'HBM Budgeting',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}
