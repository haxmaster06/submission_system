import 'package:flutter/material.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerLoader extends StatelessWidget {
  final double width;
  final double height;
  final double? borderRadius;

  const ShimmerLoader({
    super.key,
    this.width = double.infinity,
    this.height = 100,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFE2E8F0),
      highlightColor: const Color(0xFFF1F5F9),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius != null
              ? BorderRadius.circular(borderRadius!)
              : UiKit.borderRadiusDefault,
        ),
      ),
    );
  }
}

class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subValue;
  final bool isCurrency;
  final IconData icon;
  final Color baseColor;
  final VoidCallback? onTap;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    this.subValue,
    this.isCurrency = false,
    required this.icon,
    this.baseColor = UiKit.primaryBlue,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isPrimary = baseColor == UiKit.primaryBlue;

    return Container(
      decoration: BoxDecoration(
        color: isPrimary ? UiKit.primaryBlue : UiKit.backgroundWhite,
        borderRadius: UiKit.borderRadiusDefault,
        boxShadow: isPrimary ? UiKit.mediumShadow : UiKit.softShadow,
      ),
      child: ClipRRect(
        borderRadius: UiKit.borderRadiusDefault,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isPrimary
                          ? Colors.white.withValues(alpha: 0.2)
                          : baseColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      icon,
                      color: isPrimary ? Colors.white : baseColor,
                      size: 24,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    title,
                    style: UiKit.caption.copyWith(
                      color: isPrimary ? Colors.white70 : UiKit.textGray,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        value,
                        style: UiKit.heading2.copyWith(
                          color: isPrimary ? Colors.white : UiKit.textBlack,
                          fontSize: value.length > 3 ? 20 : 24,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (subValue != null) ...[
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            isCurrency ? _formatCurrency(subValue!) : subValue!,
                            style: UiKit.heading3.copyWith(
                              color: isPrimary
                                  ? Colors.white.withValues(alpha: 0.8)
                                  : baseColor,
                              fontSize: isCurrency ? 14 : 18,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _formatCurrency(String val) {
    try {
      final double amount = double.parse(val);
      if (amount >= 1000000000) {
        return '${(amount / 1000000000).toStringAsFixed(1)}M';
      } else if (amount >= 1000000) {
        return '${(amount / 1000000).toStringAsFixed(1)}jt';
      }
      return val;
    } catch (_) {
      return val;
    }
  }
}
