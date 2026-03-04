import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';
import 'package:mobile/features/submissions/repositories/submission_repository.dart';

// State class to hold the list of submissions and any filtering parameters
class SubmissionListState {
  final List<Submission> submissions;
  final bool isLoading;
  final String? error;
  final int currentPage;
  final bool hasReachedMax;

  SubmissionListState({
    this.submissions = const [],
    this.isLoading = false,
    this.error,
    this.currentPage = 1,
    this.hasReachedMax = false,
  });

  SubmissionListState copyWith({
    List<Submission>? submissions,
    bool? isLoading,
    String? error,
    int? currentPage,
    bool? hasReachedMax,
  }) {
    return SubmissionListState(
      submissions: submissions ?? this.submissions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
    );
  }
}

class SubmissionListNotifier extends StateNotifier<SubmissionListState> {
  final SubmissionRepository _repository;

  SubmissionListNotifier(this._repository) : super(SubmissionListState()) {
    fetchInitialSubmissions();
  }

  Future<void> fetchInitialSubmissions() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final submissions = await _repository.getSubmissions(page: 1);
      state = state.copyWith(
        submissions: submissions,
        isLoading: false,
        currentPage: 1,
        hasReachedMax: submissions.length < 10,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadMore() async {
    if (state.isLoading || state.hasReachedMax) return;

    state = state.copyWith(isLoading: true, error: null);
    try {
      final nextPage = state.currentPage + 1;
      final newSubmissions = await _repository.getSubmissions(page: nextPage);

      state = state.copyWith(
        submissions: [...state.submissions, ...newSubmissions],
        isLoading: false,
        currentPage: nextPage,
        hasReachedMax: newSubmissions.length < 10,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refresh() async {
    await fetchInitialSubmissions();
  }
}

final submissionListProvider =
    StateNotifierProvider.autoDispose<
      SubmissionListNotifier,
      SubmissionListState
    >((ref) {
      // Force reconstruction when auth state changes (e.g., logout/login)
      ref.watch(authProvider);

      final repository = ref.watch(submissionRepositoryProvider);
      return SubmissionListNotifier(repository);
    });
