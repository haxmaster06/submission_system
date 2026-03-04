import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/dashboard/repositories/dashboard_repository.dart';

final dashboardSummaryProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
      // Reset provider when auth state changes (login/logout)
      ref.watch(authProvider);

      final repository = ref.watch(dashboardRepositoryProvider);
      return repository.fetchDashboardSummary();
    });

final adminStatsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((
  ref,
) async {
  // Reset provider when auth state changes
  final authState = ref.watch(authProvider);

  // Basic safeguard: skip fetch if not authenticated or not authorized
  final canAccess = authState.maybeWhen(
    authenticated: (u) => u.isSuperAdmin || u.hasPermission('view reports'),
    orElse: () => false,
  );

  if (!canAccess) {
    return {}; // Return empty data for unauthorized state
  }

  final repository = ref.watch(dashboardRepositoryProvider);
  return repository.fetchAdminStats();
});
