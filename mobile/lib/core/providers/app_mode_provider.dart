import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppMode { full, approveOnly }

class AppModeNotifier extends StateNotifier<AppMode> {
  AppModeNotifier() : super(AppMode.full) {
    _loadFromStorage();
  }

  static const _key = 'app_mode';

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);
    if (saved == 'approveOnly') {
      state = AppMode.approveOnly;
    }
  }

  Future<void> toggle() async {
    final newMode = state == AppMode.full ? AppMode.approveOnly : AppMode.full;
    state = newMode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, newMode == AppMode.approveOnly ? 'approveOnly' : 'full');
  }

  Future<void> setMode(AppMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, mode == AppMode.approveOnly ? 'approveOnly' : 'full');
  }
}

final appModeProvider = StateNotifierProvider<AppModeNotifier, AppMode>(
  (ref) => AppModeNotifier(),
);
