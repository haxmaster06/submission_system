import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/widgets/maintenance_screen.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/auth/views/login_screen.dart';
import 'package:mobile/features/splash/views/splash_screen.dart';
import 'package:mobile/features/dashboard/views/dashboard_screen.dart';
import 'package:mobile/features/submissions/views/submissions_screen.dart';
import 'package:mobile/features/submissions/views/submission_detail_screen.dart';
import 'package:mobile/features/submissions/views/submission_form_screen.dart';
import 'package:mobile/features/profile/views/profile_screen.dart';
import 'package:mobile/features/profile/views/change_password_screen.dart';
import 'package:mobile/features/approvals/views/approvals_screen.dart';
import 'package:mobile/features/notifications/views/notification_screen.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';
import 'package:mobile/shared/widgets/main_wrapper.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshNotifier(ref),
    redirect: (context, state) {
      final authState = ref.read(authProvider);

      debugPrint('Router Redirect Check - Path: ${state.matchedLocation}');

      final isAuth = authState.maybeWhen(
        authenticated: (_) => true,
        orElse: () => false,
      );

      final isLoading = authState.maybeWhen(
        initial: () => true,
        loading: () => true,
        orElse: () => false,
      );

      debugPrint('Auth Status - isAuth: $isAuth, isLoading: $isLoading');

      final isGoingToSplash = state.matchedLocation == '/splash';
      if (isGoingToSplash) return null;

      final isGoingToLogin = state.matchedLocation == '/login';

      if (isLoading) {
        debugPrint('App is loading auth state...');
        return null;
      }

      if (!isAuth && !isGoingToLogin) {
        debugPrint('Not authenticated. Redirecting to /login');
        return '/login';
      }

      if (isAuth && isGoingToLogin) {
        debugPrint('Authenticated. Redirecting to /dashboard');
        return '/dashboard'; // Redirect to initial tab
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/maintenance',
        builder: (context, state) => const MaintenanceScreen(),
      ),
      // App Shell that contains the Bottom Navigation Bar
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          final authState = ref.watch(authProvider);
          // While auth state is initializing/loading, show a spinner to avoid flash of content
          return authState.maybeWhen(
            initial: () => const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
            loading: () => const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
            authenticated: (_) => MainWrapper(navigationShell: navigationShell),
            orElse: () => const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
          );
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/submissions',
                builder: (context, state) => const SubmissionsScreen(),
                routes: [
                  GoRoute(
                    path: 'new',
                    builder: (context, state) {
                      final submission = state.extra as Submission?;
                      return SubmissionFormScreen(submission: submission);
                    },
                  ),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final id = int.parse(state.pathParameters['id']!);
                      return SubmissionDetailScreen(submissionId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          // branch 2: Approvals (Static, visibility handled in MainWrapper)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/approvals',
                builder: (context, state) {
                  // Role-based redirect if direct navigation happens
                  final authState = ref.watch(authProvider);
                  bool canAccess = authState.maybeWhen(
                    authenticated: (user) {
                      final role = user.roleName?.toLowerCase() ?? '';
                      return role == 'manager' ||
                          role == 'director' ||
                          role == 'finance' ||
                          role == 'gm' ||
                          role == 'super admin';
                    },
                    orElse: () => false,
                  );
                  if (!canAccess) return const DashboardScreen();
                  return const ApprovalsScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
                routes: [
                  GoRoute(
                    path: 'change-password',
                    builder: (context, state) => const ChangePasswordScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/notifications',
                builder: (context, state) => const NotificationScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});

/// A notifier that triggers GoRouter to re-evaluate the redirect logic
/// whenever the authentication state changes.
class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(Ref ref) {
    _subscription = ref.listen(authProvider, (_, __) {
      notifyListeners();
    });
  }

  late final ProviderSubscription _subscription;

  @override
  void dispose() {
    _subscription.close();
    super.dispose();
  }
}
