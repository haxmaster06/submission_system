import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/submissions/repositories/submission_repository.dart';

final selectableUsersProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) {
  final repository = ref.watch(submissionRepositoryProvider);
  return repository.fetchSelectableUsers();
});

final myAttachmentRequestsProvider = FutureProvider<List<dynamic>>((ref) {
  final repository = ref.watch(submissionRepositoryProvider);
  return repository.getMyAttachmentRequests();
});

class AttachmentRequestState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  AttachmentRequestState({
    this.isLoading = false,
    this.error,
    this.isSuccess = false,
  });
}

class AttachmentRequestNotifier extends StateNotifier<AttachmentRequestState> {
  final SubmissionRepository _repository;

  AttachmentRequestNotifier(this._repository) : super(AttachmentRequestState());

  Future<void> sendRequest({
    required int submissionId,
    required int targetUserId,
    required String fileDescription,
  }) async {
    state = AttachmentRequestState(isLoading: true);
    try {
      await _repository.requestAttachment(
        submissionId: submissionId,
        targetUserId: targetUserId,
        fileDescription: fileDescription,
      );
      state = AttachmentRequestState(isSuccess: true);
    } catch (e) {
      state = AttachmentRequestState(error: e.toString());
    }
  }

  Future<void> fulfillRequest({
    required int requestId,
    required dynamic formData, // Dio FormData
  }) async {
    state = AttachmentRequestState(isLoading: true);
    try {
      await _repository.fulfillAttachmentRequest(requestId, formData);
      state = AttachmentRequestState(isSuccess: true);
    } catch (e) {
      state = AttachmentRequestState(error: e.toString());
    }
  }

  void reset() {
    state = AttachmentRequestState();
  }
}

final attachmentRequestControllerProvider =
    StateNotifierProvider<AttachmentRequestNotifier, AttachmentRequestState>((
      ref,
    ) {
      final repository = ref.watch(submissionRepositoryProvider);
      return AttachmentRequestNotifier(repository);
    });
