import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

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

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Indigo Hero Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
              decoration: const BoxDecoration(
                gradient: UiKit.primaryGradient,
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(30),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        user.name.substring(0, 1).toUpperCase(),
                        style: UiKit.heading1.copyWith(
                          fontSize: 40,
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
                    user.roleName?.toUpperCase() ?? 'KARYAWAN',
                    style: UiKit.caption.copyWith(
                      color: Colors.white70,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Profile Info Card
                  _buildMenuCard(
                    title: 'Informasi Akun',
                    children: [
                      _buildMenuItem(Icons.email_outlined, 'Email', user.email),
                      const Divider(height: 32, color: UiKit.surfaceGray),
                      _buildMenuItem(
                        Icons.work_outline,
                        'Jabatan',
                        user.roleName ?? '-',
                      ),
                      const Divider(height: 32, color: UiKit.surfaceGray),
                      _buildMenuItem(
                        Icons.business_outlined,
                        'Divisi',
                        user.divisionName ?? '-',
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Settings Card
                  _buildMenuCard(
                    title: 'Pengaturan',
                    children: [
                      _buildMenuItem(
                        Icons.lock_reset_outlined,
                        'Ganti Password',
                        'Amankan akun Anda',
                        onTap: () => context.push('/profile/change-password'),
                        showArrow: true,
                      ),
                      const Divider(height: 32, color: UiKit.surfaceGray),
                      _buildMenuItem(
                        Icons.info_outline,
                        'Bantuan',
                        'Setup & Informasi lainnya',
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Silakan akses versi Website untuk pengaturan lanjut.',
                              ),
                            ),
                          );
                        },
                        showArrow: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),

                  // Logout Button (Red Outline)
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
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard({
    required String title,
    required List<Widget> children,
  }) {
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
          const SizedBox(height: 20),
          ...children,
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    IconData icon,
    String title,
    String value, {
    VoidCallback? onTap,
    bool showArrow = false,
  }) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: UiKit.primaryBlue.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: UiKit.primaryBlue, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: UiKit.caption.copyWith(color: UiKit.textGray),
                ),
                const SizedBox(height: 2),
                Text(value, style: UiKit.bodyTextBold),
              ],
            ),
          ),
          if (showArrow)
            const Icon(Icons.chevron_right, color: UiKit.textLightGray),
        ],
      ),
    );
  }
}
