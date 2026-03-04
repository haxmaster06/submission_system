import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/approvals/models/approval_model.dart';
import 'package:mobile/features/approvals/views/widgets/approval_action_dialog.dart';

class ApprovalCard extends StatelessWidget {
  final ApprovalItem item;
  final bool isHistory;
  final VoidCallback onRefresh;

  const ApprovalCard({
    super.key,
    required this.item,
    required this.isHistory,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final sub = item.submission;
    if (sub == null) return const SizedBox.shrink();

    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    );
    final total = sub.total;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: UiKit.backgroundWhite,
        borderRadius: UiKit.borderRadiusDefault,
        boxShadow: UiKit.softShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: UiKit.borderRadiusDefault,
          onTap: isHistory ? null : () => _showActionBottomSheet(context),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        sub.type,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: UiKit.heading3,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _buildStatusChip(item.status),
                  ],
                ),
                if (sub.description != null && sub.description!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    sub.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: UiKit.bodyText.copyWith(color: UiKit.textGray),
                  ),
                ],
                const SizedBox(height: 12),
                const Divider(color: UiKit.surfaceGray),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 3,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Pemohon:',
                            style: UiKit.caption.copyWith(
                              color: UiKit.textLightGray,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            sub.user_name ?? 'Unknown',
                            style: UiKit.bodyTextBold,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Total:',
                            style: UiKit.caption.copyWith(
                              color: UiKit.textLightGray,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            formatter.format(total),
                            style: UiKit.heading3.copyWith(
                              color: UiKit.primaryBlue,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (isHistory &&
                    item.notes != null &&
                    item.notes!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: UiKit.surfaceGray,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Colors.grey.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Catatan Anda:',
                          style: UiKit.caption.copyWith(
                            color: UiKit.textLightGray,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.notes!,
                          style: UiKit.bodyText.copyWith(
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color bgColor = UiKit.statusPendingBg;
    Color textColor = UiKit.statusPendingText;
    String label = status.toUpperCase();

    if (status == 'pending') {
      bgColor = UiKit.statusPendingBg;
      textColor = UiKit.statusPendingText;
      label = 'MENUNGGU';
    } else if (status == 'approved') {
      bgColor = UiKit.statusApprovedBg;
      textColor = UiKit.statusApprovedText;
      label = 'DISETUJUI';
    } else if (status == 'rejected') {
      bgColor = UiKit.statusRejectedBg;
      textColor = UiKit.statusRejectedText;
      label = 'DITOLAK';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: UiKit.borderRadiusPill,
      ),
      child: Text(
        label,
        style: UiKit.caption.copyWith(
          color: textColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showActionBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          ApprovalActionSheet(item: item, onSuccess: onRefresh),
    );
  }
}
