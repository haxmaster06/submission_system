# Deskripsi Aplikasi Mobile HBM Submission

## Ringkasan

Aplikasi Mobile HBM Submission adalah ekstensi mobile dari sistem manajemen pengajuan (Submission System) PT. HBM. Aplikasi ini dirancang untuk memudahkan karyawan dan manajemen dalam melakukan pengajuan anggaran, perjalanan dinas, serta pengelolaan gaji karyawan harian secara real-time dan mobile.

## Tujuan Utama

- **Mobilitas**: Memungkinkan staf untuk membuat pengajuan di mana saja.
- **Efisiensi Persetujuan**: Mempercepat proses approval oleh manajemen (GM, Direktur, Finance) melalui notifikasi dan antarmuka yang intuitif.
- **Akurasi Gaji**: Memastikan perhitungan gaji karyawan harian akurat melalui fitur Matrix Gaji yang terintegrasi dengan data Master.

## Teknologi Utama

- **Framework**: Flutter (Dart)
- **State Management**: Riverpod (Functional & Class-based Providers)
- **Networking**: Dio (dengan interceptor untuk autentikasi)
- **Data Persistence**: Flutter Secure Storage (untuk token JWT)
- **Navigation**: GoRouter
- **Model Layer**: Freezed & JSON Serializable (Type-safety)
