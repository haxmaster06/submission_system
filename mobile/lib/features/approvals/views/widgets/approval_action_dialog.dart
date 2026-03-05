import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/approvals/models/approval_model.dart';
import 'package:mobile/features/approvals/repositories/approval_repository.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

class ApprovalActionSheet extends ConsumerStatefulWidget {
  final ApprovalItem item;
  final VoidCallback onSuccess;

  const ApprovalActionSheet({
    super.key,
    required this.item,
    required this.onSuccess,
  });

  @override
  ConsumerState<ApprovalActionSheet> createState() =>
      _ApprovalActionSheetState();
}

class _ApprovalActionSheetState extends ConsumerState<ApprovalActionSheet> {
  final _notesController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleAction(bool isApprove) async {
    if (!isApprove && _notesController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Catatan wajib diisi jika menolak pengajuan.'),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final repo = ref.read(approvalRepositoryProvider);
      if (isApprove) {
        await repo.approveSubmission(
          widget.item.id,
          notes: _notesController.text.trim(),
        );
      } else {
        await repo.rejectSubmission(
          widget.item.id,
          _notesController.text.trim(),
        );
      }

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isApprove
                  ? 'Pengajuan berhasil disetujui'
                  : 'Pengajuan berhasil ditolak',
            ),
            backgroundColor: isApprove ? Colors.green : Colors.red,
          ),
        );
        widget.onSuccess();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleHold() async {
    if (_notesController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Catatan wajib diisi untuk menunda pengajuan.'),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final repo = ref.read(approvalRepositoryProvider);
      await repo.holdSubmission(widget.item.id, _notesController.text.trim());

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pengajuan berhasil ditunda'),
            backgroundColor: Colors.orange,
          ),
        );
        widget.onSuccess();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.maybeWhen(
      authenticated: (u) => u,
      orElse: () => null,
    );

    final sub = widget.item.submission!;
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    );
    final total = sub.total;

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        top: 32,
        left: 24,
        right: 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Konfirmasi Approval', style: UiKit.heading2),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: UiKit.backgroundGray,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                _buildInfoRow('Pemohon', sub.user_name ?? '-'),
                const Divider(height: 24),
                _buildInfoRow('Jenis', sub.type),
                const Divider(height: 24),
                _buildInfoRow(
                  'Total Nominal',
                  formatter.format(total),
                  isHighlight: true,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text('Catatan Tambahan', style: UiKit.bodyTextBold),
          const SizedBox(height: 12),
          TextField(
            controller: _notesController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Tulis keterangan di sini...',
              fillColor: UiKit.backgroundGray,
              filled: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(15),
                borderSide: BorderSide.none,
              ),
            ),
          ),

          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.info_outline, size: 14, color: UiKit.textGray),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Tanda tangan profil Anda akan dilampirkan otomatis.',
                  style: UiKit.caption.copyWith(
                    fontStyle: FontStyle.italic,
                    color: UiKit.textGray,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else
            Column(
              children: [
                Row(
                  children: [
                    if (user?.hasPermission('reject submissions') ?? false)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _handleAction(false),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red,
                            side: const BorderSide(color: Colors.red),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                          ),
                          child: const Text(
                            'TOLAK',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    if (user?.hasPermission('reject submissions') ?? false)
                      const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _handleHold,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.orange,
                          side: const BorderSide(color: Colors.orange),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                        child: const Text(
                          'TUNDA',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (user?.hasPermission('approve submissions') ?? false)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _handleAction(true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      child: const Text(
                        'SETUJUI',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: UiKit.caption.copyWith(color: UiKit.textGray)),
        const SizedBox(width: 16),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            overflow: TextOverflow.ellipsis,
            style: UiKit.bodyTextBold.copyWith(
              color: isHighlight ? UiKit.primaryBlue : UiKit.textBlack,
            ),
            maxLines: 1,
          ),
        ),
      ],
    );
  }
}
