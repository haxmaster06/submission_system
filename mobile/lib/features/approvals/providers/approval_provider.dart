import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/approvals/models/approval_model.dart';
import 'package:mobile/features/approvals/repositories/approval_repository.dart';

final pendingApprovalsProvider = FutureProvider.autoDispose
    .family<List<ApprovalItem>, int>((ref, page) async {
      // Force reconstruction when auth state changes
      ref.watch(authProvider);

      final repository = ref.watch(approvalRepositoryProvider);
      return repository.getPendingApprovals(page: page);
    });

final historyApprovalsProvider = FutureProvider.autoDispose
    .family<List<ApprovalItem>, int>((ref, page) async {
      // Force reconstruction when auth state changes
      ref.watch(authProvider);

      final repository = ref.watch(approvalRepositoryProvider);
      return repository.getHistoryApprovals(page: page);
    });
