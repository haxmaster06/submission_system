import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:mobile/features/auth/repositories/auth_repository.dart';

part 'auth_provider.freezed.dart';
part 'auth_provider.g.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.unauthenticated() = _Unauthenticated;
  const factory AuthState.error(String message) = _Error;
}

@riverpod
class Auth extends _$Auth {
  @override
  AuthState build() {
    _checkAuth();
    return const AuthState.initial();
  }

  Future<void> _checkAuth() async {
    state = const AuthState.loading();
    try {
      final user = await ref.read(authRepositoryProvider).checkAuthStatus();
      if (user != null) {
        state = AuthState.authenticated(user);
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (e) {
      state = const AuthState.unauthenticated();
    }
  }

  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    try {
      final user = await ref.read(authRepositoryProvider).login(email, password);
      state = AuthState.authenticated(user);
    } catch (e) {
      state = AuthState.error(e.toString());
      // Revert to unauthenticated after showing error
      await Future.delayed(const Duration(seconds: 2));
      state = const AuthState.unauthenticated();
    }
  }

  Future<void> logout() async {
    state = const AuthState.loading();
    await ref.read(authRepositoryProvider).logout();
    state = const AuthState.unauthenticated();
  }

  void forceLogout() {
    state = const AuthState.unauthenticated();
  }
}
