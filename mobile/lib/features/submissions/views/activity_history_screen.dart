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

  // Filter state
  String _filterStatus = 'Semua';
  DateTimeRange? _filterDateRange;

  static const List<String> _statusOptions = [
    'Semua',
    'Draf',
    'Proses',
    'Selesai',
    'Batal',
  ];

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

  bool get _hasActiveFilter => _filterStatus != 'Semua' || _filterDateRange != null;

  void _clearFilters() {
    setState(() {
      _filterStatus = 'Semua';
      _filterDateRange = null;
    });
  }

  void _showFilterSheet() {
    // Use temp variables so user can cancel
    String tempStatus = _filterStatus;
    DateTimeRange? tempDateRange = _filterDateRange;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle bar
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Filter Aktivitas', style: UiKit.heading2),
                      TextButton(
                        onPressed: () {
                          setSheetState(() {
                            tempStatus = 'Semua';
                            tempDateRange = null;
                          });
                        },
                        child: const Text('Reset', style: TextStyle(color: Colors.redAccent)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Status filter
                  const Text('Status', style: UiKit.bodyTextBold),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _statusOptions.map((status) {
                      final isSelected = tempStatus == status;
                      return GestureDetector(
                        onTap: () => setSheetState(() => tempStatus = status),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? UiKit.primaryBlue : UiKit.backgroundGray,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? UiKit.primaryBlue : Colors.grey.shade300,
                            ),
                          ),
                          child: Text(
                            status,
                            style: TextStyle(
                              fontSize: 13,
                              color: isSelected ? Colors.white : UiKit.textGray,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  // Date range filter
                  const Text('Rentang Tanggal', style: UiKit.bodyTextBold),
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () async {
                      final now = DateTime.now();
                      final picked = await showDateRangePicker(
                        context: ctx,
                        firstDate: DateTime(now.year - 2),
                        lastDate: now,
                        initialDateRange: tempDateRange,
                        locale: const Locale('id', 'ID'),
                        builder: (context, child) {
                          return Theme(
                            data: Theme.of(context).copyWith(
                              colorScheme: const ColorScheme.light(
                                primary: UiKit.primaryBlue,
                              ),
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (picked != null) {
                        setSheetState(() => tempDateRange = picked);
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: UiKit.backgroundGray,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 18, color: UiKit.primaryBlue),
                          const SizedBox(width: 12),
                          Text(
                            tempDateRange != null
                                ? '${DateFormat('dd MMM yyyy').format(tempDateRange!.start)} - ${DateFormat('dd MMM yyyy').format(tempDateRange!.end)}'
                                : 'Pilih rentang tanggal',
                            style: TextStyle(
                              fontSize: 14,
                              color: tempDateRange != null ? UiKit.textBlack : UiKit.textLightGray,
                            ),
                          ),
                          const Spacer(),
                          if (tempDateRange != null)
                            GestureDetector(
                              onTap: () => setSheetState(() => tempDateRange = null),
                              child: const Icon(Icons.close, size: 18, color: UiKit.textLightGray),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Apply button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _filterStatus = tempStatus;
                          _filterDateRange = tempDateRange;
                        });
                        Navigator.pop(ctx);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: UiKit.primaryBlue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Terapkan Filter',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  List<Submission> _applyFilters(List<Submission> list) {
    var result = list;

    // Search filter
    if (_searchQuery.isNotEmpty) {
      result = result.where((s) =>
          (s.id.toString().contains(_searchQuery.toLowerCase())) ||
          (s.description?.toLowerCase() ?? '').contains(_searchQuery.toLowerCase())
      ).toList();
    }

    // Status filter
    if (_filterStatus != 'Semua') {
      result = result.where((s) {
        final status = s.status.toLowerCase();
        switch (_filterStatus) {
          case 'Draf':
            return status == 'draf';
          case 'Proses':
            return status == 'pending' || status == 'submitted';
          case 'Selesai':
            return status == 'approved' || status == 'completed';
          case 'Batal':
            return status == 'rejected';
          default:
            return true;
        }
      }).toList();
    }

    // Date range filter
    if (_filterDateRange != null) {
      final start = _filterDateRange!.start;
      final end = _filterDateRange!.end.add(const Duration(days: 1)); // inclusive end
      result = result.where((s) {
        final d = s.createdAt.toLocal();
        return d.isAfter(start.subtract(const Duration(seconds: 1))) && d.isBefore(end);
      }).toList();
    }

    // Sort descending
    result.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(submissionListProvider);
    final notifier = ref.read(submissionListProvider.notifier);

    final displayList = _applyFilters(state.submissions);

    // Calculate monthly summary (from filtered list)
    final now = DateTime.now();
    double monthlyTotal = 0;
    for (var s in displayList) {
      if (s.createdAt.toLocal().year == now.year && s.createdAt.toLocal().month == now.month) {
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
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.filter_list),
                onPressed: _showFilterSheet,
              ),
              if (_hasActiveFilter)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
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

          // Active filter chips
          if (_hasActiveFilter)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Row(
                children: [
                  if (_filterStatus != 'Semua')
                    _buildFilterChip(_filterStatus, () => setState(() => _filterStatus = 'Semua')),
                  if (_filterDateRange != null)
                    _buildFilterChip(
                      '${DateFormat('dd/MM').format(_filterDateRange!.start)} - ${DateFormat('dd/MM').format(_filterDateRange!.end)}',
                      () => setState(() => _filterDateRange = null),
                    ),
                  const Spacer(),
                  GestureDetector(
                    onTap: _clearFilters,
                    child: const Text(
                      'Hapus Filter',
                      style: TextStyle(fontSize: 12, color: Colors.redAccent, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
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
                Text(
                  _filterDateRange != null ? 'Total Disetujui (Filter)' : 'Bulan Ini',
                  style: UiKit.caption,
                ),
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
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search_off, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 12),
                              const Text('Tidak ada riwayat aktivitas', style: UiKit.bodyText),
                              if (_hasActiveFilter) ...[
                                const SizedBox(height: 8),
                                TextButton(
                                  onPressed: _clearFilters,
                                  child: const Text('Hapus Filter'),
                                ),
                              ],
                            ],
                          ),
                        )
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

  Widget _buildFilterChip(String label, VoidCallback onRemove) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: UiKit.primaryBlue.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: UiKit.primaryBlue.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: UiKit.primaryBlue, fontWeight: FontWeight.bold)),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.close, size: 14, color: UiKit.primaryBlue),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(BuildContext context, Submission sub, NumberFormat formatter) {
    IconData icon;
    Color color;

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

    final isExpense = sub.status.toLowerCase() != 'rejected';
    final dateStr = DateFormat('dd MMM yyyy • HH:mm').format(sub.createdAt.toLocal());

    return InkWell(
      onTap: () => context.push('/submission-detail/${sub.id}'),
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
