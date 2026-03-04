# Arsitektur Teknis Aplikasi

## 1. Struktur Folder (Feature-First)

Aplikasi menggunakan pola desain berbasis fitur untuk skalabilitas:

- `lib/core`: Base configurations, networking (API Client), theme (UI Kit), dan utilitas global.
- `lib/features/auth`: Autentikasi user, login logic, dan manajemen token.
- `lib/features/submissions`: Fitur pengajuan (Views, Providers, Repositories, Models).
- `lib/features/approvals`: Logika persetujuan.
- `lib/features/dashboard`: Tampilan utama statistik.
- `lib/shared`: Widget global yang dapat digunakan kembali.

## 2. Pola Data & Komunikasi

- **Repository Pattern**: Memisahkan logika API dari UI.
- **Provider (Riverpod)**: Mengelola state aplikasi secara reaktif. Menggunakan generators (@riverpod) untuk kode yang lebih bersih.
- **DTO to Model**: Data JSON dari API dipetakan ke objek Model menggunakan `JsonSerializable`.

## 3. Komponen UI

- **UI Kit**: Kumpulan konstanta warna, tipografi, dan dekorasi standar HBM untuk konsistensi visual.
- **Modular Widgets**: Komponen besar seperti Matrix Gaji dipecah menjadi widget-widget kecil (`_buildGridCell`, `_buildInputCell`) untuk performa dan kemudahan maintenance.

## 4. Keamanan

- **Secure Storage**: Data sensitif (access token) tidak disimpan di SharedPreferences biasa, melainkan di `flutter_secure_storage`.
- **Protected Routes**: Pengecekan status login dilakukan di level router (`GoRouter`) untuk mencegah akses ke layar internal tanpa token valid.
