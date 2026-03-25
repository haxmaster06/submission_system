import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/submissions/providers/submission_list_provider.dart';
import 'package:mobile/shared/widgets/tappable_card.dart';

class RealizationListScreen extends ConsumerStatefulWidget {
  const RealizationListScreen({super.key});

  @override
  ConsumerState<RealizationListScreen> createState() => _RealizationListScreenState();
}

class _RealizationListScreenState extends ConsumerState<RealizationListScreen> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(submissionListProvider);

    // Only show approved/completed submissions that need realization
    final realizations = state.submissions.where((s) => 
      s.status.toLowerCase() == 'approved' || s.status.toLowerCase() == 'completed'
    ).toList();

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      appBar: AppBar(
        title: const Text('Monitoring Realisasi'),
        backgroundColor: Colors.white,
        foregroundColor: UiKit.textBlack,
        elevation: 0,
      ),
      body: realizations.isEmpty && state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : realizations.isEmpty
              ? const Center(child: Text('Tidak ada data yang perlu direalisasi'))
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: realizations.length,
                  itemBuilder: (context, index) {
                    final sub = realizations[index];
                    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0);
                    // Mock data for realized amount
                    final realizedAmount = sub.total * 0.9; 

                    return TappableCard(
                      margin: const EdgeInsets.only(bottom: 16),
                      boxShadow: UiKit.softShadow,
                      onTap: () {
                        // TODO: Navigate to detail realization
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('#${sub.id}', style: UiKit.caption),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.green.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    'Selesai',
                                    style: TextStyle(fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              sub.description ?? 'Pengajuan #${sub.id}',
                              style: UiKit.bodyTextBold,
                              maxLines: 2,
                            ),
                            const SizedBox(height: 16),
                            const Divider(height: 1),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Disetujui', style: UiKit.caption),
                                      const SizedBox(height: 4),
                                      Text(
                                        formatter.format(sub.total),
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: UiKit.primaryBlue),
                                      ),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Realisasi', style: UiKit.caption),
                                      const SizedBox(height: 4),
                                      Text(
                                        formatter.format(realizedAmount),
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
