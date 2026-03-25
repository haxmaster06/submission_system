import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/dashboard/providers/dashboard_provider.dart';
import 'package:mobile/core/providers/app_mode_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  void _showLogoutConfirmation(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Konfirmasi Logout'),
        content: const Text('Apakah Anda yakin ingin keluar dari aplikasi?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(authProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.maybeWhen(
      authenticated: (user) => user,
      orElse: () => null,
    );

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final role = user.roleName?.toLowerCase() ?? '';
    final isApprover = [
      'manager', 'director', 'finance', 'gm', 'hrd', 'super admin'
    ].contains(role);

    final dashboardData = ref.watch(dashboardSummaryProvider);
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 1. Purple Hero Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 60, 24, 30),
              decoration: const BoxDecoration(
                gradient: UiKit.primaryGradient,
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(30),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        user.name.substring(0, 1).toUpperCase(),
                        style: UiKit.heading1.copyWith(
                          fontSize: 36,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user.name,
                    style: UiKit.heading1.copyWith(color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: UiKit.caption.copyWith(color: Colors.white70),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.amber.withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          user.roleName?.toUpperCase() ?? 'KARYAWAN',
                          style: UiKit.caption.copyWith(
                            color: Colors.amber,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // 2. Grid Menu
                  _buildMenuCard(
                    title: 'Menu Utama',
                    children: [
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 3,
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 10,
                        childAspectRatio: 0.9,
                        children: [
                          _buildGridItem(context, Icons.account_balance_wallet, 'Anggaran', Colors.purple, '/budget'),
                          _buildGridItem(context, Icons.receipt_long, 'Pengajuan', Colors.blue, '/submissions'),
                          _buildGridItem(context, Icons.history, 'Aktivitas', Colors.orange, '/activity-history'),
                          _buildGridItem(context, Icons.verified, 'Riwayat', Colors.brown, '/submissions?filter=approved'),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // 3. Income / Expense Summary
                  dashboardData.when(
                    data: (data) {
                      final approved = data['budget']?['total_approved'] ?? 0;
                      final realized = data['budget']?['total_realized'] ?? 0;
                      return Row(
                        children: [
                          Expanded(
                            child: _buildSummaryBox(
                              'Disetujui',
                              formatter.format(approved),
                              Icons.arrow_upward,
                              Colors.green,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildSummaryBox(
                              'Realisasi',
                              formatter.format(realized),
                              Icons.arrow_downward,
                              Colors.red,
                            ),
                          ),
                        ],
                      );
                    },
                    loading: () => const SizedBox(height: 80, child: Center(child: CircularProgressIndicator())),
                    error: (_, __) => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 24),

                  // 4. Mode Switcher (KHUSUS APPROVER)
                  if (isApprover) ...[
                    _buildMenuCard(
                      title: 'Pengaturan Aplikasi',
                      children: [
                        Consumer(
                          builder: (context, ref, _) {
                            final appMode = ref.watch(appModeProvider);
                            final isApproveOnly = appMode == AppMode.approveOnly;
                            return SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Mode Approve Only', style: UiKit.bodyTextBold),
                              subtitle: Text(
                                isApproveOnly 
                                  ? 'Mode ringkas: hanya tampilkan persetujuan'
                                  : 'Mode lengkap: semua fitur tersedia',
                                style: UiKit.caption,
                              ),
                              value: isApproveOnly,
                              activeColor: UiKit.primaryBlue,
                              onChanged: (val) {
                                ref.read(appModeProvider.notifier).toggle();
                                // Optional snippet to show snackbar
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(val ? 'Mode Approve Only diaktifkan' : 'Mode Lengkap diaktifkan')),
                                );
                              },
                              secondary: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: UiKit.primaryBlue.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.swap_horiz, color: UiKit.primaryBlue),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],

                  // 5. Settings List
                  _buildMenuCard(
                    title: 'Lainnya',
                    children: [
                      _buildListMenuItem(context, Icons.list_alt, 'Pengajuan Saya', onTap: () => context.push('/submissions')),
                      const Divider(height: 1, color: UiKit.surfaceGray),
                      _buildListMenuItem(context, Icons.notifications_none, 'Notifikasi', onTap: () => context.push('/notifications')),
                      const Divider(height: 1, color: UiKit.surfaceGray),
                      _buildListMenuItem(context, Icons.lock_outline, 'Ganti Password', onTap: () => context.push('/profile/change-password')),
                      const Divider(height: 1, color: UiKit.surfaceGray),
                      _buildListMenuItem(
                        context, 
                        Icons.info_outline, 
                        'Informasi Umum', 
                        onTap: () {
                          showAboutDialog(
                            context: context,
                            applicationName: 'HBM Budgeting',
                            applicationVersion: 'v1.0.0',
                            applicationIcon: Image.asset(
                              'assets/images/logo.png', // Or whatever logo asset is suitable
                              width: 50,
                              errorBuilder: (context, error, stackTrace) => 
                                  const Icon(Icons.account_balance_wallet, size: 50, color: UiKit.primaryBlue),
                            ),
                            children: const [
                              SizedBox(height: 16),
                              Text('Aplikasi untuk manajemen pengajuan anggaran dan realisasi di lingkungan perusahaan HBM.'),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),

                  // 6. Logout Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => _showLogoutConfirmation(context, ref),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red, width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      child: const Text(
                        'KELUAR DARI APLIKASI',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard({required String title, required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: UiKit.backgroundWhite,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: UiKit.heading2.copyWith(color: UiKit.primaryBlue)),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildGridItem(BuildContext context, IconData icon, String label, Color color, String route) {
    return InkWell(
      onTap: () {
        if (route.isNotEmpty) {
          try {
            context.push(route);
          } catch (_) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fitur dalam pengembangan')));
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fitur dalam pengembangan')));
        }
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: UiKit.textBlack),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryBox(String label, String amount, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 4),
              Text(label, style: UiKit.caption),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            amount,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color == Colors.green ? Colors.green.shade700 : Colors.red.shade700,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildListMenuItem(BuildContext context, IconData icon, String title, {VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: UiKit.primaryBlue.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: UiKit.primaryBlue, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(child: Text(title, style: UiKit.bodyTextBold)),
            const Icon(Icons.chevron_right, color: UiKit.textLightGray),
          ],
        ),
      ),
    );
  }
}
