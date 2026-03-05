import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/core/services/notification_service.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/dashboard/providers/dashboard_provider.dart';
import 'package:mobile/features/notifications/providers/notification_provider.dart';
import 'package:mobile/shared/widgets/tappable_card.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _touchedPieIndex = -1;

  Future<void> _onRefresh() async {
    ref.invalidate(dashboardSummaryProvider);
    ref.invalidate(adminStatsProvider);
    // Silent check on refresh
    ref.read(notificationServiceProvider).initializeAndRequestToken();
  }

  @override
  void initState() {
    super.initState();
    // Silently verify FCM token on dashboard entry
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationServiceProvider).initializeAndRequestToken();
    });
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
            // Indigo Hero Header
            SliverToBoxAdapter(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(24, 70, 24, 80),
                    decoration: const BoxDecoration(
                      gradient: UiKit.primaryGradient,
                      borderRadius: BorderRadius.vertical(
                        bottom: Radius.circular(30),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Halo, ${user.name}',
                                    style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Berikut ringkasan aktivitas Anda hari ini',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.white.withValues(
                                        alpha: 0.7,
                                      ),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            _buildNotificationBadge(),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Floating Highlight Card
                  Positioned(
                    bottom: -50,
                    left: 24,
                    right: 24,
                    child: _buildHighlightCard(dashboardData),
                  ),
                ],
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 70)),

            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: dashboardData.when(
                loading: () => SliverToBoxAdapter(child: _buildShimmerGrid()),
                error: (err, stack) =>
                    SliverToBoxAdapter(child: Text('Terjadi kesalahan: $err')),
                data: (data) {
                  final scope = data['role_scope'] ?? 'staff';
                  return SliverList(
                    delegate: SliverChildListDelegate([
                      _buildStatGrid(data, user),
                      const SizedBox(height: 24),
                      if (scope == 'management' || scope == 'division') ...[
                        _buildTrendsSection(data['trends'] ?? []),
                        const SizedBox(height: 24),
                      ],
                      if (scope == 'management') ...[
                        _buildCategorySection(data['categories'] ?? []),
                        const SizedBox(height: 24),
                        _buildDivisionRanking(data['division_ranking'] ?? []),
                        const SizedBox(height: 24),
                      ],
                      if (scope == 'division' ||
                          (scope == 'staff' && user.roleName != 'Staff')) ...[
                        // Division Heads (HRD/GA Legal) or Managers viewing their own division
                        _buildCategorySection(data['categories'] ?? []),
                        const SizedBox(height: 24),
                      ],
                      _buildTaskList(data['pending_tasks'] ?? []),
                      const SizedBox(height: 24),
                      if (isAdmin)
                        _buildAdminLogs(data['recent_logs'] ?? [])
                      else
                        _buildActivityList(data['activities'] ?? []),
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

  Widget _buildNotificationBadge() {
    final count = ref.watch(unreadNotificationsCountProvider);
    return InkWell(
      onTap: () => context.push('/notifications'),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          shape: BoxShape.circle,
        ),
        child: Badge(
          label: Text('$count', style: const TextStyle(fontSize: 10)),
          isLabelVisible: count > 0,
          child: const Icon(Icons.notifications_outlined, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildHighlightCard(AsyncValue<Map<String, dynamic>> dashboardData) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: UiKit.backgroundWhite,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.mediumShadow,
        image: DecorationImage(
          image: const AssetImage(
            'assets/images/card_pattern.png',
          ), // If exists
          opacity: 0.05,
          fit: BoxFit.cover,
        ),
      ),
      child: dashboardData.maybeWhen(
        data: (data) {
          final tasks = data['pending_tasks'] as List? ?? [];
          return Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total Tugas Menunggu', style: UiKit.caption),
                    const SizedBox(height: 4),
                    Text(
                      '${tasks.length} Tugas',
                      style: UiKit.heading1.copyWith(color: UiKit.primaryBlue),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: UiKit.primaryBlue.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.assignment_turned_in,
                  color: UiKit.primaryBlue,
                  size: 28,
                ),
              ),
            ],
          );
        },
        orElse: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }

  Widget _buildStatGrid(Map<String, dynamic> data, User user) {
    if (user.isSuperAdmin) return _buildAdminStatGrid(data);

    final counters = data['counters'] as Map<String, dynamic>? ?? {};
    final isManagement =
        data['role_scope'] == 'management' ||
        ['Director', 'GM', 'Finance'].contains(user.roleName);

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.6,
      children: [
        _buildStatTile(
          'Total Pengajuan',
          '${counters['total'] ?? 0}',
          Icons.description_outlined,
          Colors.blue,
        ),
        _buildStatTile(
          'Menunggu',
          '${counters['pending'] ?? 0}',
          Icons.timer_outlined,
          Colors.orange,
        ),
        _buildStatTile(
          'Disetujui',
          '${counters['approved'] ?? 0}',
          Icons.check_circle_outline,
          Colors.green,
        ),
        _buildStatTile(
          isManagement ? 'Menunggu Approval' : 'Ditolak',
          isManagement
              ? '${counters['outstanding'] ?? 0}'
              : '${counters['rejected'] ?? 0}',
          isManagement ? Icons.bolt_outlined : Icons.cancel_outlined,
          isManagement ? Colors.indigo : Colors.red,
        ),
        if (data['role_scope'] == 'management' ||
            data['role_scope'] == 'division') ...[
          _buildStatTile(
            'Total Anggaran',
            '${NumberFormat.compactCurrency(locale: 'id_ID', symbol: '').format(data['budget']?['total_approved'] ?? 0)}',
            Icons.payments_outlined,
            Colors.green,
          ),
          _buildStatTile(
            'Realisasi',
            '${NumberFormat.compactCurrency(locale: 'id_ID', symbol: '').format(data['budget']?['total_realized'] ?? 0)}',
            Icons.analytics_outlined,
            Colors.red,
          ),
        ],
      ],
    );
  }

  Widget _buildAdminStatGrid(Map<String, dynamic> data) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.6,
      children: [
        _buildStatTile(
          'Pengguna',
          data['users']?['total']?.toString() ?? '0',
          Icons.people_outline,
          Colors.blue,
        ),
        _buildStatTile(
          'Pengajuan',
          data['submissions']?['total']?.toString() ?? '0',
          Icons.description_outlined,
          Colors.indigo,
        ),
        _buildStatTile(
          'Total Anggaran',
          '${NumberFormat.compactCurrency(locale: 'id_ID', symbol: '').format(data['budget']?['total_approved'] ?? 0)}',
          Icons.payments_outlined,
          Colors.green,
        ),
        _buildStatTile(
          'Realisasi',
          '${NumberFormat.compactCurrency(locale: 'id_ID', symbol: '').format(data['budget']?['total_realized'] ?? 0)}',
          Icons.analytics_outlined,
          Colors.red,
        ),
      ],
    );
  }

  Widget _buildStatTile(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return TappableCard(
      padding: const EdgeInsets.all(16),
      boxShadow: UiKit.softShadow,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 10,
                    color: UiKit.textGray,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: UiKit.bodyTextBold,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendsSection(List<dynamic> trends) {
    if (trends.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Anggaran VS Realisasi', style: UiKit.heading2),
            const SizedBox(height: 4),
            const Text(
              'Histori 6 bulan terakhir',
              style: TextStyle(fontSize: 12, color: UiKit.textGray),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                _buildLegendItem('Anggaran', Colors.blue),
                _buildLegendItem('Realisasi', Colors.green),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        TappableCard(
          padding: const EdgeInsets.only(
            left: 20,
            right: 32,
            top: 24,
            bottom: 12,
          ),
          child: SizedBox(
            height: 220,
            child: LineChart(
              LineChartData(
                lineTouchData: LineTouchData(
                  handleBuiltInTouches: true,
                  touchTooltipData: LineTouchTooltipData(
                    getTooltipColor: (spot) =>
                        UiKit.primaryBlue.withValues(alpha: 0.9),
                    tooltipRoundedRadius: 8,
                    getTooltipItems: (List<LineBarSpot> touchedBarSpots) {
                      return touchedBarSpots.map((barSpot) {
                        final flSpot = barSpot;
                        return LineTooltipItem(
                          '${barSpot.barIndex == 0 ? "Anggaran" : "Realisasi"}\n',
                          const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                          children: [
                            TextSpan(
                              text: NumberFormat.currency(
                                locale: 'id_ID',
                                symbol: 'Rp',
                                decimalDigits: 0,
                              ).format(flSpot.y),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.normal,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        );
                      }).toList();
                    },
                  ),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: Colors.grey.withValues(alpha: 0.1),
                    strokeWidth: 1,
                  ),
                ),
                clipData: const FlClipData.none(),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 16,
                      getTitlesWidget: (_, __) => const SizedBox.shrink(),
                    ),
                  ),
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 16,
                      getTitlesWidget: (_, __) => const SizedBox.shrink(),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      interval: 1,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index < 0 || index >= trends.length) {
                          return const SizedBox.shrink();
                        }
                        return Padding(
                          padding: const EdgeInsets.only(top: 10.0),
                          child: Text(
                            trends[index]['month'] ?? '',
                            style: const TextStyle(
                              fontSize: 10,
                              color: UiKit.textGray,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 60,
                      getTitlesWidget: (value, meta) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: Text(
                            NumberFormat.compact(locale: 'id_ID').format(value),
                            style: const TextStyle(
                              fontSize: 10,
                              color: UiKit.textGray,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: trends.asMap().entries.map((e) {
                      return FlSpot(
                        e.key.toDouble(),
                        (e.value['budget'] as num?)?.toDouble() ?? 0,
                      );
                    }).toList(),
                    isCurved: true,
                    color: Colors.blue,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: FlDotData(
                      show: true,
                      getDotPainter: (spot, percent, barData, index) =>
                          FlDotCirclePainter(
                            radius: 3,
                            color: Colors.white,
                            strokeWidth: 2,
                            strokeColor: Colors.blue,
                          ),
                    ),
                    belowBarData: BarAreaData(
                      show: true,
                      color: Colors.blue.withValues(alpha: 0.1),
                    ),
                  ),
                  LineChartBarData(
                    spots: trends.asMap().entries.map((e) {
                      return FlSpot(
                        e.key.toDouble(),
                        (e.value['realization'] as num?)?.toDouble() ?? 0,
                      );
                    }).toList(),
                    isCurved: true,
                    color: Colors.green,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: FlDotData(
                      show: true,
                      getDotPainter: (spot, percent, barData, index) =>
                          FlDotCirclePainter(
                            radius: 3,
                            color: Colors.white,
                            strokeWidth: 2,
                            strokeColor: Colors.green,
                          ),
                    ),
                    belowBarData: BarAreaData(
                      show: true,
                      color: Colors.green.withValues(alpha: 0.1),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: UiKit.textGray,
          ),
        ),
      ],
    );
  }

  Widget _buildCategorySection(List<dynamic> categories) {
    if (categories.isEmpty) return const SizedBox.shrink();

    final categoryColors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.red,
      Colors.purple,
      Colors.indigo,
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Analisis Kategori', style: UiKit.heading2),
        const SizedBox(height: 16),
        TappableCard(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              SizedBox(
                height: 180,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    PieChart(
                      PieChartData(
                        pieTouchData: PieTouchData(
                          touchCallback:
                              (FlTouchEvent event, pieTouchResponse) {
                                setState(() {
                                  if (!event.isInterestedForInteractions ||
                                      pieTouchResponse == null ||
                                      pieTouchResponse.touchedSection == null) {
                                    _touchedPieIndex = -1;
                                    return;
                                  }
                                  _touchedPieIndex = pieTouchResponse
                                      .touchedSection!
                                      .touchedSectionIndex;
                                });
                              },
                        ),
                        sectionsSpace: 4,
                        centerSpaceRadius: 60,
                        sections: categories.asMap().entries.map((e) {
                          final index = e.key;
                          final isTouched = index == _touchedPieIndex;
                          final radius = isTouched ? 20.0 : 16.0;
                          final value =
                              (e.value['amount'] as num?)?.toDouble() ?? 0;

                          return PieChartSectionData(
                            color:
                                categoryColors[index % categoryColors.length],
                            value: value,
                            title: '',
                            radius: radius,
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (_touchedPieIndex != -1 &&
                  _touchedPieIndex < categories.length)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    vertical: 12,
                    horizontal: 16,
                  ),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color:
                        categoryColors[_touchedPieIndex % categoryColors.length]
                            .withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color:
                          categoryColors[_touchedPieIndex %
                                  categoryColors.length]
                              .withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        categories[_touchedPieIndex]['name'] ?? '',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color:
                              categoryColors[_touchedPieIndex %
                                  categoryColors.length],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        NumberFormat.currency(
                          locale: 'id_ID',
                          symbol: 'Rp ',
                          decimalDigits: 0,
                        ).format(
                          (categories[_touchedPieIndex]['amount'] as num?)
                                  ?.toDouble() ??
                              0,
                        ),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: UiKit.textBlack,
                        ),
                      ),
                    ],
                  ),
                ),
              Wrap(
                spacing: 16,
                runSpacing: 8,
                children: categories.asMap().entries.map((e) {
                  final index = e.key;
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: categoryColors[index % categoryColors.length],
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        e.value['name'] ?? 'Unknown',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: UiKit.textGray,
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDivisionRanking(List<dynamic> ranking) {
    if (ranking.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Ranking Divisi', style: UiKit.heading2),
        const SizedBox(height: 16),
        TappableCard(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Column(
            children: ranking.take(5).map((div) {
              final total = (div['total'] as num?)?.toDouble() ?? 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          div['name'] ?? '',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          NumberFormat.compactCurrency(
                            locale: 'id_ID',
                            symbol: 'Rp',
                          ).format(total),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: total / (ranking.first['total'] ?? 1),
                        backgroundColor: Colors.blue.withValues(alpha: 0.1),
                        valueColor: const AlwaysStoppedAnimation(Colors.blue),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildTaskList(List<dynamic> tasks) {
    if (tasks.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Tugas Menunggu', style: UiKit.heading2),
        const SizedBox(height: 16),
        ...tasks.take(5).map((task) => _buildTaskCard(task)),
      ],
    );
  }

  Widget _buildTaskCard(dynamic task) {
    return TappableCard(
      margin: const EdgeInsets.only(bottom: 12),
      boxShadow: UiKit.softShadow,
      onTap: () => context.push('/submissions/${task['submission_id']}'),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: UiKit.primaryBlue.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.assignment_outlined,
            color: UiKit.primaryBlue,
            size: 20,
          ),
        ),
        title: Text(
          task['description'] ?? 'Satu Tugas',
          style: UiKit.bodyTextBold,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          task['no_pengajuan'] ?? '-',
          style: UiKit.caption,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: const Icon(Icons.chevron_right, color: UiKit.textLightGray),
      ),
    );
  }

  Widget _buildActivityList(List<dynamic> activities) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Aktivitas Terkini', style: UiKit.heading2),
        const SizedBox(height: 16),
        ...activities.take(3).map((act) => _buildActivityItem(act)),
      ],
    );
  }

  Widget _buildActivityItem(dynamic act) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: UiKit.primaryBlue,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              '${act['actor_name']} memperbarui pengajuan ${act['no_pengajuan']}',
              style: UiKit.bodyText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdminLogs(List<dynamic> logs) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Log Sistem', style: UiKit.heading2),
        const SizedBox(height: 16),
        ...logs
            .take(3)
            .map(
              (log) => _buildActivityItem({
                'actor_name': log['user'],
                'no_pengajuan': '#${log['model_id']}',
              }),
            ),
      ],
    );
  }

  Widget _buildShimmerGrid() {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.6,
      children: List.generate(
        4,
        (index) => Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: UiKit.borderRadiusCard,
          ),
        ),
      ),
    );
  }
}
