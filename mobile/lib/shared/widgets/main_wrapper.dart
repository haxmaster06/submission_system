import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:mobile/core/providers/app_mode_provider.dart';

class MainWrapper extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const MainWrapper({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Check role for dynamic navigation
    final authState = ref.watch(authProvider);
    final isApprover = authState.maybeWhen(
      authenticated: (user) => user.isApprover,
      orElse: () => false,
    );

    final appMode = ref.watch(appModeProvider);
    final isApproveOnly = isApprover && appMode == AppMode.approveOnly;

    // Map visible indices to branch indices
    // Branches in app_router:
    // 0 = Dashboard, 1 = Submissions, 2 = Approvals, 3 = Profile, 4 = Notifications (not in nav), 5 = Budget (new)
    
    List<int> visibleToBranch;
    int selectedIndex;
    final currentBranch = navigationShell.currentIndex;

    if (isApproveOnly) {
      visibleToBranch = [2, 3]; // 2: Approvals, 3: Profile
      if (currentBranch == 2) selectedIndex = 0;
      else if (currentBranch == 3) selectedIndex = 1;
      else selectedIndex = 0; // Fallback
    } else {
      visibleToBranch = [0, 1, 5, 3]; // 0: Dashboard, 1: Submissions, 5: Budget, 3: Profile
      if (currentBranch == 0) selectedIndex = 0;
      else if (currentBranch == 1) selectedIndex = 1;
      else if (currentBranch == 5) selectedIndex = 2; // Budget
      else if (currentBranch == 3) selectedIndex = 3; // Profile
      else selectedIndex = 0; // Fallback
    }

    return Scaffold(
      body: navigationShell,
      floatingActionButton: isApproveOnly ? null : FloatingActionButton(
        onPressed: () => context.push('/submissions/new'),
        backgroundColor: UiKit.primaryBlue,
        shape: const CircleBorder(),
        elevation: 4,
        child: const Icon(Icons.add, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        color: UiKit.backgroundWhite,
        elevation: 10,
        height: 70,
        padding: EdgeInsets.zero,
        child: isApproveOnly 
          ? Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildNavItem(0, selectedIndex, Icons.fact_check_outlined, Icons.fact_check, 'Persetujuan', () => _goBranch(0, visibleToBranch)),
                _buildNavItem(1, selectedIndex, Icons.person_outline, Icons.person, 'Profil', () => _goBranch(1, visibleToBranch)),
              ],
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, selectedIndex, Icons.home_outlined, Icons.home, 'Beranda', () => _goBranch(0, visibleToBranch)),
                _buildNavItem(1, selectedIndex, Icons.list_alt_outlined, Icons.list_alt, 'Pengajuan', () => _goBranch(1, visibleToBranch)),
                const SizedBox(width: 48), // Space for FAB
                _buildNavItem(2, selectedIndex, Icons.account_balance_wallet_outlined, Icons.account_balance_wallet, 'Anggaran', () => _goBranch(2, visibleToBranch)),
                _buildNavItem(3, selectedIndex, Icons.person_outline, Icons.person, 'Profil', () => _goBranch(3, visibleToBranch)),
              ],
            ),
      ),
    );
  }

  void _goBranch(int index, List<int> visibleToBranch) {
    if (index >= visibleToBranch.length) return;
    final targetBranch = visibleToBranch[index];
    debugPrint('[MainWrapper] _goBranch: visibleIndex=$index, targetBranch=$targetBranch, currentBranch=${navigationShell.currentIndex}');
    navigationShell.goBranch(
      targetBranch,
      initialLocation: true,
    );
  }

  Widget _buildNavItem(int index, int selectedIndex, IconData iconOutlined, IconData iconFilled, String label, VoidCallback onTap) {
    final isSelected = index == selectedIndex;
    return InkWell(
      onTap: onTap,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: SizedBox(
        width: 70,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? iconFilled : iconOutlined,
              color: isSelected ? UiKit.primaryBlue : UiKit.textLightGray,
              size: isSelected ? 26 : 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? UiKit.primaryBlue : UiKit.textLightGray,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
