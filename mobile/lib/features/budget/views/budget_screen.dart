import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:mobile/features/dashboard/providers/dashboard_provider.dart';

class BudgetScreen extends ConsumerWidget {
  const BudgetScreen({super.key});

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

    final isAdmin = user.isSuperAdmin;
    final dashboardData = isAdmin
        ? ref.watch(adminStatsProvider)
        : ref.watch(dashboardSummaryProvider);

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      appBar: AppBar(
        title: const Text('Anggaran (Budget)'),
        backgroundColor: Colors.white,
        foregroundColor: UiKit.textBlack,
        elevation: 0,
      ),
      body: dashboardData.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Gagal memuat data: $err')),
        data: (data) {
          final budget = data['budget'] ?? {};
          final totalApproved = (budget['total_approved'] as num?)?.toDouble() ?? 0;
          final totalRealized = (budget['total_realized'] as num?)?.toDouble() ?? 0;
          
          final int pendingCount = isAdmin
              ? (data['submissions']?['pending'] as num?)?.toInt() ?? 0
              : (data['counters']?['pending'] as num?)?.toInt() ?? 0;

          final trends = (data['trends'] as List<dynamic>?) ?? [];
          final categories = (data['categories'] as List<dynamic>?) ?? [];

          final formatter = NumberFormat.compactCurrency(
            locale: 'id_ID',
            symbol: 'Rp',
            decimalDigits: 1,
          );

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(dashboardSummaryProvider);
              ref.invalidate(adminStatsProvider);
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Ringkasan Keuangan', style: UiKit.heading2),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildStatBox(
                          'Disetujui',
                          formatter.format(totalApproved),
                          UiKit.primaryBlue,
                          Icons.check_circle_outline,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildStatBox(
                          'Realisasi',
                          formatter.format(totalRealized),
                          Colors.green,
                          Icons.account_balance_wallet_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildStatBox(
                    'Menunggu Persetujuan',
                    '$pendingCount Pengajuan',
                    Colors.orange,
                    Icons.pending_actions,
                    isFullWidth: true,
                  ),
                  const SizedBox(height: 32),
                  
                  _buildTrendsSection(trends, formatter),
                  const SizedBox(height: 32),
                  _buildCategorySection(categories),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatBox(String title, String value, Color color, IconData icon, {bool isFullWidth = false}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: isFullWidth 
        ? Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: UiKit.caption),
                  const SizedBox(height: 4),
                  Text(value, style: UiKit.heading2.copyWith(color: color)),
                ],
              ),
            ],
          )
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 16),
              Text(title, style: UiKit.caption),
              const SizedBox(height: 4),
              Text(value, style: UiKit.heading2.copyWith(color: color)),
            ],
          ),
    );
  }

  Widget _buildTrendsSection(List<dynamic> trends, NumberFormat formatter) {
    if (trends.isEmpty) return const SizedBox.shrink();

    return Column(
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
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.only(left: 10, right: 30, top: 24, bottom: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: UiKit.borderRadiusCard,
            boxShadow: UiKit.softShadow,
          ),
          child: SizedBox(
            height: 220,
            child: LineChart(
              LineChartData(
                lineTouchData: LineTouchData(
                  handleBuiltInTouches: true,
                  touchTooltipData: LineTouchTooltipData(
                    getTooltipColor: (_) => UiKit.primaryBlue.withValues(alpha: 0.9),
                    tooltipRoundedRadius: 8,
                    getTooltipItems: (touchedSpots) {
                      return touchedSpots.map((spot) {
                        final isBudget = spot.barIndex == 0;
                        return LineTooltipItem(
                          '${isBudget ? "Anggaran" : "Realisasi"}\n',
                          const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          children: [
                            TextSpan(
                              text: formatter.format(spot.y),
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.normal),
                            ),
                          ],
                        );
                      }).toList();
                    },
                  ),
                ),
                gridData: const FlGridData(show: false),
                titlesData: FlTitlesData(
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      interval: 1,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index < 0 || index >= trends.length) return const SizedBox.shrink();
                        return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            trends[index]['month'].toString(),
                            style: const TextStyle(color: UiKit.textGray, fontSize: 11),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 35,
                      getTitlesWidget: (value, meta) {
                        if (value == 0 || value == meta.max) return const SizedBox.shrink();
                        return Text(
                          NumberFormat.compact(locale: 'id_ID').format(value),
                          style: const TextStyle(color: UiKit.textLightGray, fontSize: 10),
                        );
                      },
                    ),
                  ),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    isCurved: true,
                    color: Colors.blue,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: Colors.blue.withValues(alpha: 0.1),
                    ),
                    spots: trends.asMap().entries.map((e) {
                      final val = (e.value['budget'] as num?)?.toDouble() ?? 0;
                      return FlSpot(e.key.toDouble(), val);
                    }).toList(),
                  ),
                  LineChartBarData(
                    isCurved: true,
                    color: Colors.green,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: Colors.green.withValues(alpha: 0.1),
                    ),
                    spots: trends.asMap().entries.map((e) {
                      final val = (e.value['realization'] as num?)?.toDouble() ?? 0;
                      return FlSpot(e.key.toDouble(), val);
                    }).toList(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCategorySection(List<dynamic> categories) {
    if (categories.isEmpty) return const SizedBox.shrink();
    
    final List<Color> pieColors = [
      Colors.blue, Colors.orange, Colors.purple, Colors.green, Colors.red, Colors.teal
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Distribusi Kategori', style: UiKit.heading2),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: UiKit.borderRadiusCard,
            boxShadow: UiKit.softShadow,
          ),
          child: Column(
            children: [
              SizedBox(
                height: 200,
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 2,
                    centerSpaceRadius: 40,
                    sections: categories.asMap().entries.map((e) {
                      final color = pieColors[e.key % pieColors.length];
                      final value = (e.value['amount'] as num?)?.toDouble() ?? 0;
                      return PieChartSectionData(
                        color: color,
                        value: value,
                        title: '${e.value['count']}',
                        radius: 50,
                        titleStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: categories.asMap().entries.map((e) {
                  return _buildLegendItem(
                    e.value['name'] ?? 'Unknown',
                    pieColors[e.key % pieColors.length],
                  );
                }).toList(),
              ),
            ],
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
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: UiKit.textBlack)),
      ],
    );
  }
}
