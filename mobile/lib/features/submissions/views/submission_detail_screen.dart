import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/submissions/repositories/submission_repository.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/features/submissions/views/widgets/request_attachment_modal.dart';
import 'package:mobile/features/approvals/models/approval_model.dart';
import 'package:mobile/features/approvals/views/widgets/approval_action_dialog.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:mobile/features/submissions/providers/submission_list_provider.dart';
import 'package:collection/collection.dart';

final submissionDetailProvider = FutureProvider.autoDispose
    .family<Submission, int>((ref, id) async {
      final repository = ref.watch(submissionRepositoryProvider);
      return repository.getSubmission(id);
    });

class SubmissionDetailScreen extends ConsumerWidget {
  final int submissionId;
  const SubmissionDetailScreen({super.key, required this.submissionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailState = ref.watch(submissionDetailProvider(submissionId));
    final authState = ref.watch(authProvider);
    final user = authState.maybeWhen(
      authenticated: (u) => u,
      orElse: () => null,
    );

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      body: detailState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Gagal memuat detail: $err')),
        data: (submission) {
          final dio = ref.watch(dioProvider);
          final String baseUrl = dio.options.baseUrl.replaceAll(
            RegExp(r'/api/?$'),
            '',
          );

          // Authorization Check for Displaying Action Buttons
          final activeStage = submission.approval_stages.firstWhereOrNull(
            (s) =>
                s.status.toLowerCase() == 'pending' &&
                s.step_order == submission.current_approval_step,
          );

          bool isAuthorizedApprover = false;
          if (activeStage != null && user != null) {
            final isApprover = user.id == activeStage.approver_id;
            final isSuperAdmin = user.isSuperAdmin;
            final isRoleMatch = user.roleName == activeStage.role_name;
            final isProxy =
                user.hasPermission('proxy director signature') &&
                activeStage.role_name == 'Director';

            isAuthorizedApprover =
                isApprover || isRoleMatch || isSuperAdmin || isProxy;
          }

          final bool isOwner = user?.id == submission.userId;
          final bool isDraft = submission.status.toLowerCase() == 'draf';

          return Scaffold(
            backgroundColor: UiKit.backgroundGray,
            bottomNavigationBar: isAuthorizedApprover
                ? _buildApprovalActions(context, ref, submission, activeStage!)
                : (isOwner && isDraft
                      ? _buildDraftActions(context, ref, submission)
                      : null),
            body: CustomScrollView(
              slivers: [
                _buildMiniHero(context, ref, submission),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        _buildInfoCard(submission),
                        const SizedBox(height: 24),
                        Builder(
                          builder: (context) {
                            final isSalaryType = submission.type
                                .toLowerCase()
                                .contains('gaji');
                            final hasSalaryPayload =
                                submission.payload != null &&
                                submission.payload!['type']
                                        ?.toString()
                                        .toLowerCase() ==
                                    'salary';

                            if (hasSalaryPayload ||
                                (isSalaryType && submission.payload != null)) {
                              return _buildSalarySection(submission);
                            } else if (submission.details.isNotEmpty) {
                              return _buildDetailsList(submission);
                            } else {
                              return _buildDetailsList(submission);
                            }
                          },
                        ),
                        const SizedBox(height: 24),
                        _buildAttachmentsSection(
                          context,
                          ref,
                          submission,
                          user,
                          baseUrl,
                        ),
                        const SizedBox(height: 24),
                        _buildTimelineSection(submission),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMiniHero(
    BuildContext context,
    WidgetRef ref,
    Submission submission,
  ) {
    return SliverToBoxAdapter(
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
        decoration: const BoxDecoration(
          gradient: UiKit.primaryGradient,
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(
                    Icons.arrow_back_ios,
                    color: Colors.white,
                    size: 20,
                  ),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                Text(
                  '#${submission.id}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  onPressed: () =>
                      ref.invalidate(submissionDetailProvider(submissionId)),
                  icon: const Icon(Icons.refresh, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Text(
              submission.description ?? '-',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildChip(
                  submission.status.toUpperCase(),
                  Colors.white.withValues(alpha: 0.2),
                ),
                if (submission.isUrgent) ...[
                  const SizedBox(width: 8),
                  _buildChip('MENDESAK', Colors.redAccent),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildInfoCard(Submission submission) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        children: [
          _buildInfoRow('Jenis Pengajuan', submission.type.toUpperCase()),
          const Divider(height: 32),
          _buildInfoRow('Pemohon', submission.user_name ?? '-'),
          const Divider(height: 32),
          _buildInfoRow('Divisi', submission.division_name ?? '-'),
          const Divider(height: 32),
          _buildInfoRow(
            'Tanggal',
            DateFormat('dd MMMM yyyy').format(
              (submission.status.toLowerCase() == 'draf' && submission.updatedAt != null
                  ? submission.updatedAt!
                  : submission.createdAt).toLocal(),
            ),
          ),
          if (submission.notes.isNotEmpty) ...[
            const Divider(height: 32),
            _buildInfoRow('Catatan', submission.notes),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: UiKit.caption),
        const SizedBox(width: 16),
        Flexible(
          child: Text(
            value,
            style: UiKit.bodyTextBold,
            textAlign: TextAlign.right,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildDetailsList(Submission submission) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    );
    // Removed manual total sum, using submission.total

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Rincian Biaya', style: UiKit.heading3),
          const SizedBox(height: 20),
          ...submission.details.map(
            (d) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text(d.description, style: UiKit.bodyText)),
                  Text(formatter.format(d.amount), style: UiKit.bodyTextBold),
                ],
              ),
            ),
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text('Total Keseluruhan', style: UiKit.bodyTextBold),
              ),
              Text(
                formatter.format(submission.total),
                style: UiKit.heading2.copyWith(color: UiKit.primaryBlue),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentsSection(
    BuildContext context,
    WidgetRef ref,
    Submission submission,
    dynamic user,
    String baseUrl,
  ) {
    if (submission.attachments.isEmpty && submission.userId != user?.id) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Lampiran', style: UiKit.heading3),
            if (submission.userId == user?.id)
              TextButton.icon(
                onPressed: () => showDialog(
                  context: context,
                  builder: (_) =>
                      RequestAttachmentModal(submissionId: submission.id),
                ),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Minta Berkas'),
              ),
          ],
        ),
        const SizedBox(height: 12),
        ...submission.attachments.map((file) => _buildFileTile(file, baseUrl)),
      ],
    );
  }

  Widget _buildFileTile(dynamic file, String baseUrl) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: UiKit.surfaceGray),
      ),
      child: Row(
        children: [
          const Icon(Icons.insert_drive_file, color: UiKit.primaryBlue),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              file.originalName,
              style: UiKit.caption,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            onPressed: () =>
                launchUrl(Uri.parse('$baseUrl/storage/${file.filePath}')),
            icon: const Icon(
              Icons.download,
              size: 18,
              color: UiKit.primaryBlue,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineSection(Submission submission) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Riwayat Persetujuan', style: UiKit.heading3),
          const SizedBox(height: 24),
          if (submission.status.toLowerCase() == 'draf') ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: Colors.amber.shade700,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Pengajuan ini masih berupa draf dan belum diterbitkan. Alur persetujuan akan dimulai setelah pengajuan diterbitkan.',
                      style: UiKit.caption.copyWith(
                        color: Colors.amber.shade900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
          ...submission.approval_stages.asMap().entries.map(
            (e) => _buildTimelineItem(
              e.value,
              e.key == submission.approval_stages.length - 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(dynamic stage, bool isLast) {
    Color color;
    switch (stage.status.toLowerCase()) {
      case 'approved':
        color = Colors.green;
        break;
      case 'rejected':
        color = Colors.red;
        break;
      default:
        color = Colors.orange;
        break;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            if (!isLast)
              Container(width: 2, height: 40, color: UiKit.surfaceGray),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                stage.role_name ?? 'Persetuju',
                style: UiKit.bodyTextBold,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                stage.status.toUpperCase(),
                style: UiKit.caption.copyWith(color: color),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSalarySection(Submission submission) {
    if (submission.payload == null) {
      return Container(
        margin: const EdgeInsets.only(top: 24),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: UiKit.borderRadiusCard,
          boxShadow: UiKit.softShadow,
        ),
        child: Column(
          children: [
            const Text('Rincian Gaji Karyawan', style: UiKit.heading3),
            const SizedBox(height: 16),
            const Text(
              'Data rincian matriks gaji tidak ditemukan (Payload Null).',
              style: TextStyle(color: Colors.red),
            ),
          ],
        ),
      );
    }

    late SalaryPayload salaryData;
    try {
      salaryData = SalaryPayload.fromJson(submission.payload!);
    } catch (e) {
      return Container(
        margin: const EdgeInsets.only(top: 24),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: UiKit.borderRadiusCard,
          boxShadow: UiKit.softShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Rincian Gaji Karyawan', style: UiKit.heading3),
            const SizedBox(height: 16),
            Text(
              'Gagal memuat rincian gaji (Parsing Error): $e',
              style: UiKit.caption.copyWith(color: Colors.red),
            ),
          ],
        ),
      );
    }
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    );

    return Container(
      margin: const EdgeInsets.only(top: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiKit.borderRadiusCard,
        boxShadow: UiKit.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Rincian Gaji Karyawan', style: UiKit.heading3),
          if (salaryData.dateRange != null) ...[
            const SizedBox(height: 4),
            Builder(
              builder: (context) {
                final startStr =
                    salaryData.dateRange!['start']?.toString() ?? '';
                final endStr = salaryData.dateRange!['end']?.toString() ?? '';
                String formattedRange = '$startStr s/d $endStr';

                try {
                  final start = DateTime.parse(startStr);
                  final end = DateTime.parse(endStr);
                  final dF = DateFormat('dd MMMM yyyy', 'id_ID');
                  formattedRange = '${dF.format(start)} s/d ${dF.format(end)}';
                } catch (_) {}

                return Text(
                  'Periode: $formattedRange',
                  style: UiKit.caption.copyWith(color: Colors.grey[600]),
                );
              },
            ),
          ],
          const SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 20,
              headingRowHeight: 40,
              dataRowMinHeight: 48,
              dataRowMaxHeight: 60,
              columns: const [
                DataColumn(
                  label: Text('Nama Karyawan', style: UiKit.bodyTextBold),
                ),
                DataColumn(label: Text('Hadir', style: UiKit.bodyTextBold)),
                DataColumn(label: Text('Total', style: UiKit.bodyTextBold)),
              ],
              rows: salaryData.employees.map((emp) {
                return DataRow(
                  cells: [
                    DataCell(
                      SizedBox(
                        width: 120,
                        child: Text(
                          emp.employeeName,
                          style: UiKit.bodyText,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    DataCell(
                      Text('${emp.totalDays ?? 0}', style: UiKit.bodyText),
                    ),
                    DataCell(
                      Text(
                        formatter.format(emp.totalSalary ?? 0),
                        style: UiKit.bodyTextBold.copyWith(
                          color: UiKit.primaryBlue,
                        ),
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text('Total Keseluruhan', style: UiKit.bodyTextBold),
              ),
              Text(
                formatter.format(submission.total),
                style: UiKit.heading2.copyWith(color: UiKit.primaryBlue),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildApprovalActions(
    BuildContext context,
    WidgetRef ref,
    Submission submission,
    ApprovalStage activeStage,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            offset: const Offset(0, -5),
            blurRadius: 10,
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () =>
                    _showApprovalModal(context, ref, submission, activeStage),
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
            const SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: () =>
                    _showApprovalModal(context, ref, submission, activeStage),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  elevation: 0,
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
      ),
    );
  }

  void _showApprovalModal(
    BuildContext context,
    WidgetRef ref,
    Submission submission,
    ApprovalStage activeStage,
  ) {
    // Map ApprovalStage to ApprovalItem
    final approvalItem = ApprovalItem(
      id: activeStage.id,
      submissionId: submission.id,
      roleId: activeStage.roleId,
      status: activeStage.status,
      stepOrder: activeStage.step_order,
      approverId: activeStage.approver_id,
      notes: activeStage.notes,
      roleName: activeStage.role_name,
      approverName: activeStage.approver_name,
      submission: submission,
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ApprovalActionSheet(
        item: approvalItem,
        onSuccess: () {
          ref.invalidate(submissionDetailProvider(submissionId));
        },
      ),
    );
  }

  Widget _buildDraftActions(
    BuildContext context,
    WidgetRef ref,
    Submission submission,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            offset: const Offset(0, -5),
            blurRadius: 10,
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Hapus Draf'),
                      content: const Text(
                        'Apakah Anda yakin ingin menghapus draf pengajuan ini? Tindakan ini tidak dapat dibatalkan.',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Batal'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.red,
                          ),
                          child: const Text('Hapus'),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true) {
                    try {
                      final repo = ref.read(submissionRepositoryProvider);
                      await repo.deleteSubmission(submission.id);
                      ref.read(submissionListProvider.notifier).refresh();
                      if (context.mounted) {
                        context.pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Draf berhasil dihapus'),
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Gagal menghapus draf: $e')),
                        );
                      }
                    }
                  }
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: const Icon(Icons.delete_outline, size: 20),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  context.push('/submissions/new', extra: submission);
                },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: const Text(
                  'UBAH',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Terbitkan Pengajuan'),
                      content: const Text(
                        'PENTING: Apakah Anda yakin ingin menerbitkan pengajuan ini?\n\n'
                        'Konsekuensi:\n'
                        '1. Pengajuan akan segera masuk ke alur persetujuan.\n'
                        '2. Anda TIDAK AKAN BISA mengubah data lagi setelah diterbitkan.\n'
                        '3. Nomor pengajuan resmi akan dibuat otomatis.\n\n'
                        'Lanjutkan?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Batal'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('Ya, Terbitkan'),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true) {
                    try {
                      final repo = ref.read(submissionRepositoryProvider);
                      await repo.publishSubmission(submission.id);
                      ref.invalidate(submissionDetailProvider(submissionId));
                      ref.read(submissionListProvider.notifier).refresh();
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Pengajuan diterbitkan'),
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(
                          context,
                        ).showSnackBar(SnackBar(content: Text('Gagal: $e')));
                      }
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: UiKit.primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: const Text(
                  'TERBITKAN',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
