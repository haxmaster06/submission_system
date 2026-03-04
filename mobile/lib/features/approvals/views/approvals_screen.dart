import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/approvals/providers/approval_provider.dart';
import 'package:mobile/features/approvals/views/widgets/approval_card.dart';

class ApprovalsScreen extends ConsumerStatefulWidget {
  const ApprovalsScreen({super.key});

  @override
  ConsumerState<ApprovalsScreen> createState() => _ApprovalsScreenState();
}

class _ApprovalsScreenState extends ConsumerState<ApprovalsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final pendingAsync = ref.watch(pendingApprovalsProvider(1));
    final pendingCount = pendingAsync.maybeWhen(
      data: (items) => items.length,
      orElse: () => 0,
    );

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      body: Column(
        children: [
          // Mini-Hero Section
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(24, 60, 24, 30),
            decoration: const BoxDecoration(
              gradient: UiKit.primaryGradient,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Persetujuan',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$pendingCount pengajuan menunggu persetujuan Anda',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Pill Style Tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Container(
              height: 50,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(25),
                boxShadow: UiKit.softShadow,
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(25),
                  color: UiKit.primaryBlue,
                ),
                labelColor: Colors.white,
                unselectedLabelColor: UiKit.textGray,
                labelStyle: const TextStyle(fontWeight: FontWeight.bold),
                dividerColor: Colors.transparent,
                indicatorSize: TabBarIndicatorSize.tab,
                tabs: const [
                  Tab(text: 'Menunggu'),
                  Tab(text: 'Riwayat'),
                ],
              ),
            ),
          ),

          const SizedBox(height: 10),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [_buildPendingList(), _buildHistoryList()],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingList() {
    final pendingAsync = ref.watch(pendingApprovalsProvider(1));

    return pendingAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Gagal memuat: $e')),
      data: (items) {
        if (items.isEmpty) {
          return const Center(child: Text('Tidak ada persetujuan menunggu.'));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(24),
          itemCount: items.length,
          itemBuilder: (context, index) {
            return ApprovalCard(
              item: items[index],
              isHistory: false,
              onRefresh: () => ref.invalidate(pendingApprovalsProvider(1)),
            );
          },
        );
      },
    );
  }

  Widget _buildHistoryList() {
    final historyAsync = ref.watch(historyApprovalsProvider(1));

    return historyAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Gagal memuat: $e')),
      data: (items) {
        if (items.isEmpty) {
          return const Center(child: Text('Belum ada riwayat persetujuan.'));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(24),
          itemCount: items.length,
          itemBuilder: (context, index) {
            return ApprovalCard(
              item: items[index],
              isHistory: true,
              onRefresh: () {},
            );
          },
        );
      },
    );
  }
}
