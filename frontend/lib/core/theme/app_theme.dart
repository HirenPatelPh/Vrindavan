import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const Color primary = Color(0xFF4F46E5);

  /// Dark navy for the left navigation rail / drawer — the "admin dashboard" look: a dark
  /// sidebar set against the light content area for crisp contrast.
  static const Color sidebarBg = Color(0xFF2A2D4A);

  /// Slightly lighter navy used for the selected-item pill inside the rail.
  static const Color sidebarSelectedBg = Color(0xFF3A3F63);

  /// Teal/cyan accent — highlights the selected nav item against the dark navy.
  static const Color accent = Color(0xFF2DD4BF);

  /// Muted light-gray for unselected rail icons/labels.
  static const Color sidebarUnselected = Color(0xFFCBD5E1);

  /// Light gray for the per-page title bar (the strip under the dark top bar). Kept distinct
  /// from the top shell bar (which stays dark navy) so pages don't stack two dark bands.
  static const Color pageBarBg = Color(0xFFE5E7EB);

  /// Dark slate for text/icons on the light page-title bar.
  static const Color pageBarFg = Color(0xFF1E293B);

  static ThemeData get light {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: primary),
      scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      // Per-page title bars are light gray with dark text (so pages don't stack two dark bands).
      // The single dark top "shell" bar is styled explicitly in AppShell, overriding this.
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: pageBarBg,
        foregroundColor: pageBarFg,
        iconTheme: IconThemeData(color: pageBarFg),
        titleTextStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: pageBarFg),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder(), filled: true),
    );

    return base.copyWith(
      // Heavier weights across the board for clarity — headings/titles bold, body a touch
      // heavier than the default w400.
      textTheme: base.textTheme.copyWith(
        headlineMedium: base.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
        headlineSmall: base.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
        titleLarge: base.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        titleMedium: base.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        titleSmall: base.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
        bodyLarge: base.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
        bodyMedium: base.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
        labelLarge: base.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
      ),
      // Tabs live inside the now-light page-title bar (e.g. Product detail's Images/Units/…):
      // active tab in dark teal with a teal underline, inactive ones in muted slate.
      tabBarTheme: const TabBarThemeData(
        labelColor: Color(0xFF0F6E56),
        unselectedLabelColor: Color(0xFF64748B),
        indicatorColor: Color(0xFF0F6E56),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Color(0xFFCBD5E1),
        labelStyle: TextStyle(fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500),
      ),
      navigationRailTheme: const NavigationRailThemeData(
        backgroundColor: sidebarBg,
        useIndicator: true,
        indicatorColor: sidebarSelectedBg,
        selectedIconTheme: IconThemeData(color: accent),
        unselectedIconTheme: IconThemeData(color: sidebarUnselected),
        selectedLabelTextStyle: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        unselectedLabelTextStyle: TextStyle(color: sidebarUnselected, fontWeight: FontWeight.w500),
      ),
    );
  }

  /// Dark-navy theme applied only to the mobile [Drawer] contents so its icons/labels read as
  /// light-on-dark, matching the rail. Wrap the drawer's child in `Theme(data: AppTheme.sidebar, ...)`.
  static ThemeData sidebar(BuildContext context) {
    final base = Theme.of(context);
    return base.copyWith(
      iconTheme: const IconThemeData(color: sidebarUnselected),
      listTileTheme: const ListTileThemeData(
        iconColor: sidebarUnselected,
        textColor: sidebarUnselected,
        selectedColor: accent,
      ),
      textTheme: base.textTheme.apply(bodyColor: sidebarUnselected, displayColor: sidebarUnselected),
      dividerColor: const Color(0xFF3A3F63),
    );
  }
}
