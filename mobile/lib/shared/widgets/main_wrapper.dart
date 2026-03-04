import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

class MainWrapper extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const MainWrapper({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Check role for dynamic navigation
    final authState = ref.watch(authProvider);
    final isApprover = authState.maybeWhen(
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

    // Map visible indices to branch indices
    final List<int> visibleToBranch = [0, 1];
    if (isApprover) visibleToBranch.add(2);
    visibleToBranch.add(3); // Profile is branch 3

    // Map branch index to visible index
    int selectedIndex = 0;
    final currentBranch = navigationShell.currentIndex;
    if (currentBranch == 0)
      selectedIndex = 0;
    else if (currentBranch == 1)
      selectedIndex = 1;
    else if (currentBranch == 2)
      selectedIndex = 2; // Approvals
    else if (currentBranch == 3)
      selectedIndex = isApprover ? 3 : 2; // Profile
    else
      selectedIndex = 0; // Fallback for notifications or others

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: UiKit.backgroundWhite,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
          child: NavigationBar(
            height: 75,
            elevation: 0,
            backgroundColor: UiKit.backgroundWhite,
            selectedIndex: selectedIndex,
            indicatorColor: UiKit.primaryBlue.withValues(alpha: 0.1),
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            onDestinationSelected: (int index) {
              navigationShell.goBranch(
                visibleToBranch[index],
                initialLocation:
                    visibleToBranch[index] == navigationShell.currentIndex,
              );
            },
            destinations: [
              NavigationDestination(
                icon: const Icon(
                  Icons.dashboard_outlined,
                  size: 24,
                  color: UiKit.textGray,
                ),
                selectedIcon: const Icon(
                  Icons.dashboard,
                  size: 28,
                  color: UiKit.primaryBlue,
                ),
                label: 'Beranda',
              ),
              NavigationDestination(
                icon: const Icon(
                  Icons.assignment_outlined,
                  size: 24,
                  color: UiKit.textGray,
                ),
                selectedIcon: const Icon(
                  Icons.assignment,
                  size: 28,
                  color: UiKit.primaryBlue,
                ),
                label: 'Pengajuan',
              ),
              if (isApprover)
                NavigationDestination(
                  icon: const Icon(
                    Icons.fact_check_outlined,
                    size: 24,
                    color: UiKit.textGray,
                  ),
                  selectedIcon: const Icon(
                    Icons.fact_check,
                    size: 28,
                    color: UiKit.primaryBlue,
                  ),
                  label: 'Persetujuan',
                ),
              NavigationDestination(
                icon: const Icon(
                  Icons.person_outline,
                  size: 24,
                  color: UiKit.textGray,
                ),
                selectedIcon: const Icon(
                  Icons.person,
                  size: 28,
                  color: UiKit.primaryBlue,
                ),
                label: 'Profil',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
