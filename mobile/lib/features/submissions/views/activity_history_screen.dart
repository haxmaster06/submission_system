import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';
import 'package:mobile/features/submissions/providers/submission_list_provider.dart';

class ActivityHistoryScreen extends ConsumerStatefulWidget {
  const ActivityHistoryScreen({super.key});

  @override
  ConsumerState<ActivityHistoryScreen> createState() => _ActivityHistoryScreenState();
}

class _ActivityHistoryScreenState extends ConsumerState<ActivityHistoryScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      ref.read(submissionListProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(submissionListProvider);
    final notifier = ref.read(submissionListProvider.notifier);

    // Filter by search query
    var displayList = state.submissions;
    if (_searchQuery.isNotEmpty) {
      displayList = displayList.where((s) =>
          (s.id.toString().contains(_searchQuery.toLowerCase())) ||
          (s.description?.toLowerCase() ?? '').contains(_searchQuery.toLowerCase())
      ).toList();
    }

    // Sort descending by date
    displayList.sort((a, b) => b.createdAt.compareTo(a.createdAt));

    // Calculate monthly summary
    final now = DateTime.now();
    double monthlyTotal = 0;
    for (var s in displayList) {
      if (s.createdAt.year == now.year && s.createdAt.month == now.month) {
        if (s.status.toLowerCase() == 'approved' || s.status.toLowerCase() == 'completed') {
          monthlyTotal += s.total;
        }
      }
    }

    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0);

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      appBar: AppBar(
        title: const Text('Riwayat Aktivitas'),
        backgroundColor: Colors.white,
        foregroundColor: UiKit.textBlack,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // TODO: Implement advanced filter
            },
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari Aktivitas Anggaran...',
                prefixIcon: const Icon(Icons.search, color: UiKit.textGray),
                filled: true,
                fillColor: UiKit.backgroundGray,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (val) {
                setState(() => _searchQuery = val);
              },
            ),
          ),

          // Monthly Summary
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: UiKit.backgroundGray,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Bulan Ini', style: UiKit.caption),
                const SizedBox(height: 4),
                Text(
                  '- ${formatter.format(monthlyTotal)}',
                  style: UiKit.heading2.copyWith(color: Colors.red.shade700),
                ),
              ],
            ),
          ),

          // Transaction List
          Expanded(
            child: RefreshIndicator(
              onRefresh: notifier.refresh,
              child: displayList.isEmpty && state.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : displayList.isEmpty
                      ? const Center(child: Text('Tidak ada riwayat aktivitas'))
                      : ListView.builder(
                          controller: _scrollController,
                          itemCount: displayList.length + (state.hasReachedMax ? 0 : 1),
                          itemBuilder: (context, index) {
                            if (index >= displayList.length) {
                              return const Padding(
                                padding: EdgeInsets.all(16.0),
                                child: Center(child: CircularProgressIndicator()),
                              );
                            }
                            return _buildTransactionItem(context, displayList[index], formatter);
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(BuildContext context, Submission sub, NumberFormat formatter) {
    IconData icon;
    Color color;
    
    // Assigning dummy map for activity types (in HBM it maps to Submission type/category)
    if (sub.type.toLowerCase().contains('gaji') || sub.type.toLowerCase() == 'salary') {
      icon = Icons.payments;
      color = Colors.blue;
    } else if (sub.type.toLowerCase().contains('perjalanan')) {
      icon = Icons.flight;
      color = Colors.orange;
    } else {
      icon = Icons.receipt;
      color = Colors.purple;
    }

    final isExpense = sub.status.toLowerCase() != 'rejected'; // All approved/pending are potential expenses
    final dateStr = DateFormat('dd MMM yyyy • HH:mm').format(sub.createdAt);

    return InkWell(
      onTap: () => context.push('/submissions/${sub.id}'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(bottom: BorderSide(color: UiKit.surfaceGray)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    sub.description ?? 'Pengajuan #${sub.id}',
                    style: UiKit.bodyTextBold,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(dateStr, style: UiKit.caption),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  (isExpense ? '- ' : '') + formatter.format(sub.total),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isExpense ? Colors.black87 : Colors.green.shade700,
                  ),
                ),
                const SizedBox(height: 4),
                _buildStatusBadge(sub.status),
              ],
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: UiKit.textLightGray, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label;
    switch (status.toLowerCase()) {
      case 'draf':
        color = Colors.blueGrey;
        label = 'Draf';
        break;
      case 'approved':
      case 'completed':
        color = UiKit.statusApprovedText;
        label = 'Selesai';
        break;
      case 'rejected':
        color = UiKit.statusRejectedText;
        label = 'Batal';
        break;
      default:
        color = UiKit.statusPendingText;
        label = 'Proses';
        break;
    }

    return Text(
      label,
      style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.bold),
    );
  }
}
