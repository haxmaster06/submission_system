import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';
import 'package:mobile/features/submissions/providers/submission_list_provider.dart';
import 'package:mobile/shared/widgets/tappable_card.dart';

class SubmissionsScreen extends ConsumerStatefulWidget {
  const SubmissionsScreen({super.key});

  @override
  ConsumerState<SubmissionsScreen> createState() => _SubmissionsScreenState();
}

class _SubmissionsScreenState extends ConsumerState<SubmissionsScreen> {
  final ScrollController _scrollController = ScrollController();
  String _filterStatus = 'All';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(submissionListProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(submissionListProvider);
    final notifier = ref.read(submissionListProvider.notifier);

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      appBar: AppBar(
        title: const Text('Pengajuan Saya'),
        backgroundColor: Colors.white,
        foregroundColor: UiKit.textBlack,
        elevation: 0,
      ),
      body: Column(
        children: [
          // White Filter Bar with Pill Chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(bottom: 16, top: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  _buildPillTab('All', 'Semua'),
                  _buildPillTab('draf', 'Draf'),
                  _buildPillTab('pending', 'Menunggu'),
                  _buildPillTab('approved', 'Disetujui'),
                  _buildPillTab('rejected', 'Ditolak'),
                ],
              ),
            ),
          ),

          Expanded(
            child: RefreshIndicator(
              onRefresh: notifier.refresh,
              child: _buildList(state),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/submissions/new'),
        backgroundColor: UiKit.primaryBlue,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildPillTab(String value, String label) {
    bool isSelected = _filterStatus == value;
    return GestureDetector(
      onTap: () => setState(() => _filterStatus = value),
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? UiKit.primaryBlue : UiKit.backgroundGray,
          borderRadius: BorderRadius.circular(25),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : UiKit.textGray,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildList(SubmissionListState state) {
    var displayList = state.submissions;
    if (_filterStatus != 'All') {
      displayList = displayList
          .where((s) => s.status.toLowerCase() == _filterStatus.toLowerCase())
          .toList();
    }

    if (displayList.isEmpty && state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (displayList.isEmpty) {
      return const Center(child: Text('Tidak ada data pengajuan'));
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(20),
      itemCount: displayList.length + (state.hasReachedMax ? 0 : 1),
      itemBuilder: (context, index) {
        if (index >= displayList.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
          );
        }
        return _SubmissionItem(submission: displayList[index]);
      },
    );
  }
}

class _SubmissionItem extends StatelessWidget {
  final Submission submission;
  const _SubmissionItem({required this.submission});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    );
    final totalAmount = submission.total;

    return TappableCard(
      onTap: () => context.push('/submissions/${submission.id}'),
      margin: const EdgeInsets.only(bottom: 16),
      boxShadow: UiKit.softShadow,
      borderRadius: UiKit.borderRadiusCard,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatusBadge(submission.status),
                Text(
                  DateFormat('dd MMM yyyy').format(submission.createdAt),
                  style: UiKit.caption,
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              submission.description ?? 'Submission #${submission.id}',
              style: UiKit.bodyTextBold,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: UiKit.primaryBlue.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.category_outlined,
                    size: 14,
                    color: UiKit.primaryBlue,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    submission.type.toUpperCase(),
                    style: UiKit.caption.copyWith(fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Expanded(
                  child: Text(
                    'Total Nominal',
                    style: UiKit.caption,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  formatter.format(totalAmount),
                  style: UiKit.heading3.copyWith(color: UiKit.primaryBlue),
                ),
              ],
            ),
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
        label = 'DRAF';
        break;
      case 'approved':
        color = UiKit.statusApprovedText;
        label = 'DISETUJUI';
        break;
      case 'rejected':
        color = UiKit.statusRejectedText;
        label = 'DITOLAK';
        break;
      default:
        color = UiKit.statusPendingText;
        label = 'MENUNGGU';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
