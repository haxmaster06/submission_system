import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/notifications/models/notification_model.dart';
import 'package:mobile/features/notifications/repositories/notification_repository.dart';

final notificationsProvider =
    AsyncNotifierProvider.autoDispose<
      NotificationsNotifier,
      List<NotificationModel>
    >(NotificationsNotifier.new);

class NotificationsNotifier
    extends AutoDisposeAsyncNotifier<List<NotificationModel>> {
  @override
  Future<List<NotificationModel>> build() async {
    // Force reconstruction when auth state changes
    ref.watch(authProvider);
    return ref.read(notificationRepositoryProvider).getNotifications();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(notificationRepositoryProvider).getNotifications(),
    );
  }

  Future<void> markAsRead(String id) async {
    try {
      await ref.read(notificationRepositoryProvider).markAsRead(id);
      final currentList = state.valueOrNull ?? [];
      state = AsyncValue.data(
        currentList.map((n) {
          if (n.id == id) {
            return n.copyWith(readAt: DateTime.now());
          }
          return n;
        }).toList(),
      );
    } catch (e) {
      // Log or handle error
    }
  }

  Future<void> markAllRead() async {
    try {
      await ref.read(notificationRepositoryProvider).markAllRead();
      final currentList = state.valueOrNull ?? [];
      state = AsyncValue.data(
        currentList.map((n) => n.copyWith(readAt: DateTime.now())).toList(),
      );
    } catch (e) {
      // Log or handle error
    }
  }

  Future<void> deleteNotification(String id) async {
    try {
      await ref.read(notificationRepositoryProvider).deleteNotification(id);
      final currentList = state.valueOrNull ?? [];
      state = AsyncValue.data(currentList.where((n) => n.id != id).toList());
    } catch (e) {
      // Log or handle error
    }
  }

  Future<void> clearAll() async {
    try {
      await ref.read(notificationRepositoryProvider).batchDelete([]);
      state = const AsyncValue.data([]);
    } catch (e) {
      // Log or handle error
    }
  }
}

final unreadNotificationsCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider).valueOrNull ?? [];
  return notifications.where((n) => !n.isRead).length;
});
