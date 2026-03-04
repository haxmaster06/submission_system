# Notification System Documentation & Troubleshooting

Dokumen ini menjelaskan arsitektur sistem notifikasi (FCM & In-App) pada folder `submission_system` dan cara menangani masalah yang sering terjadi.

## Arsitektur Sistem

1.  **Backend (Laravel)**:
    - **Notification Class**: `app/Notifications/NewSubmissionNotification.php` (menentukan payload).
    - **Custom Channel**: `app/Broadcasting/FcmChannel.php` (mengirim data ke Firebase).
    - **Queue**: Notifikasi dikirim melalui background worker (`hbm-worker`).
    - **Token Storage**: Disimpan di tabel `fcm_tokens`.

2.  **Mobile (Flutter)**:
    - **Service**: `lib/core/services/notification_service.dart` (registrasi token & handler pesan).
    - **Trigger**: Sinkronisasi dilakukan setiap kali Dashboard dibuka via `DashboardScreen.dart`.
    - **Local Notifications**: Digunakan untuk menampilkan popup saat aplikasi sedang terbuka (foreground).

---

## Masalah Umum & Solusi

### 1. Notifikasi Tidak Muncul di HP Pasifik (Finance/User)

**Gejala**: Backend melaporkan sukses, tapi HP tidak menerima notifikasi.
**Penyebab Terakhir**: Worker (`hbm-worker`) menyimpan konfigurasi Firebase yang lama (stale) di memori.
**Solusi**:

- Restart seluruh layanan backend: `docker restart hbm-app hbm-worker`.
- Jalankan: `php artisan queue:restart`.
- Minta user untuk **Log Out & Log In** kembali atau buka Dashboard untuk mendaftarkan ulang token.

### 2. Error `PlatformException(invalid_icon, ...)`

**Gejala**: Aplikasi crash saat inisialisasi notifikasi (terlihat di log/SnackBar debug).
**Penyebab**: Plugin `flutter_local_notifications` tidak bisa menemukan ikon dari folder `mipmap`.
**Solusi**:

- Pastikan file ikon ada di folder `mobile/android/app/src/main/res/drawable/app_icon.png`.
- Di `NotificationService.dart`, pastikan `AndroidInitializationSettings` menggunakan nama `'app_icon'`.

### 3. Error `Requested entity was not found` di Laravel Log

**Gejala**: Muncul di `storage/logs/laravel.log`.
**Penyebab**:

- `FIREBASE_CREDENTIALS` di `.env` menunjuk ke file JSON yang salah atau proyek Firebase yang berbeda.
- Token yang dikirim user sudah tidak valid (unregistered).
  **Solusi**:
- Pastikan `google-services.json` (Mobile) dan `firebase-service-account.json` (Backend) berasal dari **Project ID yang sama** (`hbm-project-001`).

---

## Perintah Debug Berguna

- **Cek Token User di DB**:
    ```bash
    docker exec hbm-db mysql -u hbm_user -phbm_password hbm_budgeting -e "select * from fcm_tokens where user_id = [ID_USER];"
    ```
- **Monitor Log Pengiriman**:
    ```bash
    docker exec hbm-app tail -f storage/logs/laravel.log | grep FcmChannel
    ```
- **Monitor Worker**:
    ```bash
    docker logs hbm-worker -f
    ```
