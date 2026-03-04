import 'package:flutter/material.dart';
import 'package:mobile/core/theme/ui_kit.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: UiKit.backgroundGray,
      colorScheme: ColorScheme.fromSeed(
        seedColor: UiKit.primaryBlue,
        primary: UiKit.primaryBlue,
        secondary: UiKit.primaryBlue,
        surface: UiKit.backgroundWhite,
        brightness: Brightness.light,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: UiKit.textBlack,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: UiKit.textBlack,
          letterSpacing: -0.5,
        ),
        iconTheme: IconThemeData(color: UiKit.textBlack),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: UiKit.backgroundWhite,
        elevation: 0,
        indicatorColor: UiKit.primaryBlue.withValues(alpha: 0.1),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return UiKit.caption.copyWith(
              color: UiKit.primaryBlue,
              fontWeight: FontWeight.bold,
            );
          }
          return UiKit.caption;
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: UiKit.primaryBlue, size: 26);
          }
          return const IconThemeData(color: UiKit.textLightGray, size: 24);
        }),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: UiKit.backgroundWhite,
        shape: RoundedRectangleBorder(borderRadius: UiKit.borderRadiusCard),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: UiKit.borderRadiusDefault,
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: UiKit.borderRadiusDefault,
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: UiKit.borderRadiusDefault,
          borderSide: const BorderSide(color: UiKit.primaryBlue, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: UiKit.borderRadiusDefault,
          borderSide: const BorderSide(color: Colors.redAccent, width: 1),
        ),
        filled: true,
        fillColor: UiKit.backgroundGray,
        labelStyle: UiKit.bodyText,
        hintStyle: UiKit.caption,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 18,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: UiKit.primaryBlue,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(56),
          textStyle: UiKit.bodyTextBold.copyWith(fontSize: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(22),
          ),
          elevation: 0,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: UiKit.primaryBlue,
          textStyle: UiKit.bodyTextBold,
        ),
      ),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
    );
  }
}
