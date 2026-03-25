import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/core/services/notification_service.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/dashboard/providers/dashboard_provider.dart';
import 'package:mobile/features/notifications/providers/notification_provider.dart';
import 'package:mobile/features/auth/models/user_model.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final TextEditingController _searchController = TextEditingController();

  Future<void> _onRefresh() async {
    ref.invalidate(dashboardSummaryProvider);
    ref.invalidate(adminStatsProvider);
    ref.read(notificationServiceProvider).initializeAndRequestToken();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationServiceProvider).initializeAndRequestToken();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.maybeWhen(
      authenticated: (u) => u,
      orElse: () => null,
    );

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final isAdmin = user.isSuperAdmin;
    final dashboardData = isAdmin
        ? ref.watch(adminStatsProvider)
        : ref.watch(dashboardSummaryProvider);

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Header Section
            SliverToBoxAdapter(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(24, 70, 24, 60),
                    decoration: const BoxDecoration(
                      gradient: UiKit.primaryGradient,
                      borderRadius: BorderRadius.vertical(
                        bottom: Radius.circular(30),
                      ),
                    ),
                    child: dashboardData.when(
                      loading: () => const Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      ),
                      error: (err, stack) => const Text(
                        'Gagal memuat data',
                        style: TextStyle(color: Colors.white),
                      ),
                      data: (data) {
                        final totalBudget = data['budget']?['total_approved'] ?? 0;
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Total Budget',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white70,
                                fontWeight: FontWeight.normal,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              NumberFormat.currency(
                                locale: 'id_ID',
                                symbol: 'Rp',
                                decimalDigits: 0,
                              ).format(totalBudget),
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _buildQuickAction(
                                  icon: Icons.add_circle_outline,
                                  label: 'Ajukan',
                                  onTap: () => context.push('/submissions/new'),
                                ),
                                _buildQuickAction(
                                  icon: Icons.fact_check_outlined,
                                  label: 'Setujui',
                                  onTap: () => context.push('/approvals'),
                                ),
                                _buildQuickAction(
                                  icon: Icons.send_outlined,
                                  label: 'Kirim',
                                  onTap: () => context.push('/submissions?filter=draf'),
                                ),
                                _buildQuickAction(
                                  icon: Icons.mail_outline,
                                  label: 'Inbox',
                                  onTap: () => context.push('/notifications'),
                                  badgeCount: ref.watch(
                                    unreadNotificationsCountProvider,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 24)),

            // Search Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Cari Pengajuan...',
                    prefixIcon: const Icon(Icons.search, color: UiKit.textGray),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 16,
                      horizontal: 20,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  onSubmitted: (query) {
                    if (query.isNotEmpty) {
                      context.push('/submissions?search=$query');
                    }
                  },
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 24)),

            // Body Section
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: dashboardData.when(
                loading: () => SliverToBoxAdapter(child: _buildShimmerGrid()),
                error: (err, stack) => const SliverToBoxAdapter(
                  child: SizedBox.shrink(),
                ),
                data: (data) {
                  return SliverList(
                    delegate: SliverChildListDelegate([
                      _buildAdminToolsGrid(data, user),
                      const SizedBox(height: 32),
                      _buildSystemFeed(data),
                      const SizedBox(height: 40),
                    ]),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    int? badgeCount,
  }) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Stack(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: Colors.white, size: 28),
              ),
              if (badgeCount != null && badgeCount > 0)
                Positioned(
                  top: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      badgeCount > 9 ? '9+' : '$badgeCount',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdminToolsGrid(Map<String, dynamic> data, dynamic user) {
    // Generate menu items based on roles/permissions
    final role = user.roleName?.toLowerCase() ?? '';
    final isApprover = [
      'manager', 'director', 'finance', 'gm', 'hrd', 'super admin'
    ].contains(role);

    List<Map<String, dynamic>> tools = [
      {
        'icon': Icons.list_alt,
        'label': 'Pengajuan',
        'route': '/submissions',
        'color': Colors.blue,
      },
      {
        'icon': Icons.add_box,
        'label': 'Baru',
        'route': '/submissions/new',
        'color': Colors.orange,
      },
    ];

    if (isApprover) {
      tools.add({
        'icon': Icons.fact_check,
        'label': 'Persetujuan',
        'route': '/approvals',
        'color': Colors.green,
      });
      tools.add({
        'icon': Icons.account_balance_wallet,
        'label': 'Anggaran',
        'route': '/budget',
        'color': Colors.purple,
      });
    }

    tools.add({
      'icon': Icons.history,
      'label': 'Riwayat',
      'route': '/activity-history',
      'color': Colors.brown,
    });

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: UiKit.backgroundWhite,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Admin Tools', style: UiKit.heading2),
          const SizedBox(height: 20),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 20,
              crossAxisSpacing: 10,
              childAspectRatio: 0.8,
            ),
            itemCount: tools.length,
            itemBuilder: (context, index) {
              final tool = tools[index];
              return InkWell(
                onTap: () {
                  if (tool['route'].isNotEmpty) {
                    // Try to navigate, if route not implemented yet it might throw or redirect
                    try {
                      context.push(tool['route']);
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Fitur dalam pengembangan')),
                      );
                    }
                  }
                },
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: (tool['color'] as Color).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        tool['icon'] as IconData,
                        color: tool['color'] as Color,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      tool['label'],
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: UiKit.textBlack,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSystemFeed(Map<String, dynamic> data) {
    List<dynamic> combinedFeed = [];
    final activities = data['activities'] as List? ?? [];
    final tasks = data['pending_tasks'] as List? ?? [];
    final logs = data['recent_logs'] as List? ?? [];

    if (tasks.isNotEmpty) {
      combinedFeed.addAll(tasks.map((t) => {'type': 'task', 'data': t}));
    }
    if (activities.isNotEmpty) {
      combinedFeed.addAll(activities.map((a) => {'type': 'activity', 'data': a}));
    }
    if (logs.isNotEmpty) {
      combinedFeed.addAll(logs.map((l) => {'type': 'log', 'data': l}));
    }

    if (combinedFeed.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: UiKit.backgroundWhite,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('System Feed', style: UiKit.heading2),
          const SizedBox(height: 16),
          ...combinedFeed.take(5).map((feedItem) {
            IconData icon;
            Color color;
            String text;

            if (feedItem['type'] == 'task') {
              icon = Icons.assignment_late;
              color = Colors.orange;
              text = feedItem['data']['description'] ?? 'Tugas Menunggu: ${feedItem['data']['no_pengajuan']}';
            } else if (feedItem['type'] == 'activity') {
              icon = Icons.history;
              color = Colors.blue;
              text = '${feedItem['data']['actor_name']} memperbarui pengajuan ${feedItem['data']['no_pengajuan']}';
            } else {
              icon = Icons.security;
              color = Colors.green;
              text = 'Log sistem diperbarui oleh ${feedItem['data']['user']}';
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: color, size: 16),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      text,
                      style: UiKit.bodyText,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildShimmerGrid() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiKit.borderRadiusCard,
      ),
      height: 200,
      child: const Center(child: CircularProgressIndicator()),
    );
  }
}
