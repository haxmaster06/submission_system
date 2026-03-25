import 'package:flutter/material.dart';

class UiKit {
  // 1. Colors - Modern Corporate Purple Palette
  static const Color primaryBlue = Color(0xFF6A1B9A); // Deep Purple
  static const Color primaryIndigo = Color(0xFF6A1B9A);
  static const Color primaryGradientStart = Color(0xFF4A148C);
  static const Color primaryGradientEnd = Color(0xFF7B1FA2);

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryGradientStart, primaryGradientEnd],
  );

  static BoxDecoration glassDecoration({
    double opacity = 0.1,
    double blur = 10,
  }) => BoxDecoration(
    color: Colors.white.withValues(alpha: opacity),
    borderRadius: borderRadiusDefault,
    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
  );

  static const Color backgroundWhite = Color(0xFFFFFFFF);
  static const Color backgroundGray = Color(0xFFF5F6FA); // Modern Soft Gray
  static const Color surfaceGray = Color(0xFFF3F4F6);

  static const Color textBlack = Color(0xFF0F172A);
  static const Color textGray = Color(0xFF64748B);
  static const Color textLightGray = Color(0xFF94A3B8);

  // Status Colors (Soft Palette)
  static const Color statusApprovedBg = Color(0xFFE8F5E9);
  static const Color statusApprovedText = Color(0xFF2E7D32);
  static const Color statusPendingBg = Color(0xFFFFF3E0);
  static const Color statusPendingText = Color(0xFFEF6C00);
  static const Color statusRejectedBg = Color(0xFFFFEBEE);
  static const Color statusRejectedText = Color(0xFFC62828);

  // 2. Shadows - Soft & Unified
  static List<BoxShadow> softShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.1),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> mediumShadow = [
    BoxShadow(
      color: primaryBlue.withValues(alpha: 0.12),
      blurRadius: 30,
      offset: const Offset(0, 12),
    ),
  ];

  // 3. Radius - Unified Modern Style
  static BorderRadius borderRadiusGlobal = BorderRadius.circular(20);
  static BorderRadius borderRadiusDefault = BorderRadius.circular(20);
  static BorderRadius borderRadiusCard = BorderRadius.circular(24);
  static BorderRadius borderRadiusButton = BorderRadius.circular(20);
  static BorderRadius borderRadiusPill = BorderRadius.circular(999);

  // 4. Text Styles - Modern Typography Hierarchy
  static const TextStyle heading1 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: textBlack,
    letterSpacing: -0.5,
  );

  static const TextStyle heading2 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: textBlack,
  );

  static const TextStyle heading3 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: textBlack,
  );

  static const TextStyle bodyText = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.normal,
    color: textGray,
    height: 1.5,
  );

  static const TextStyle bodyTextBold = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: textBlack,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.normal,
    color: textLightGray,
  );
}
