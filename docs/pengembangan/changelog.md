# Changelog — HBM Budgeting System

Riwayat penambahan fitur dan perubahan signifikan pada sistem.

---

## [2026-03-05] — Fitur Tunda (Hold Approval) & Bug Fixes

### Ditambahkan

- **Status Approval "Tunda" (On Hold)**: Approver dapat menunda pengajuan dengan catatan. Pemilik mendapat notifikasi untuk merevisi, lalu approver review ulang.
- **Notifikasi Tunda & Revisi**: `SubmissionHeldNotification` (ke pemilik) dan `SubmissionRevisedNotification` (ke approver) via database, broadcast, dan FCM.
- **Endpoint Hold**: `POST /approvals/{approval}/hold` dengan validasi catatan wajib.
- **Revisi Pengajuan On Hold**: `SubmissionController.update()` mendukung edit pengajuan berstatus `on_hold`, otomatis set status `revised` dan notifikasi approver.
- **FCM Token Unregister**: Method `unregisterToken()` di `NotificationService` Flutter, dipanggil saat logout.

### Diperbaiki

- **Bug Dashboard Navigation**: Klik task approval dari dashboard kini mengarah ke halaman review (bukan detail submission) — Web dan Mobile.
- **Bug FCM Token Persist**: Token FCM dihapus dari backend saat user logout, mencegah notifikasi silang antar akun.

### Diubah

- **ApprovalController.pending()**: Include status `revised` agar approver melihat pengajuan yang sudah direvisi.
- **Frontend Approvals**: Tombol Tunda (amber) di samping Tolak/Setujui, badge "Sudah Direvisi" (indigo), status "Ditunda" di riwayat.
- **Frontend Submissions**: Status `on_hold` dengan label "Ditunda", tombol "Revisi Pengajuan" di detail view.
- **Mobile Flutter**: Tombol TUNDA di dialog approval, badge DITUNDA/DIREVISI di approval card.

---

## [2026-03-05] — Mobile App Download & Server-Side Pagination

### Ditambahkan

- **Mobile App Download**: Super Admin dapat mengunggah, mengelola, dan mendistribusikan file APK/IPA melalui halaman admin.
- **Banner Download**: Dashboard menampilkan banner unduh untuk rilis aktif per platform.
- **Upload Limit 200MB**: Konfigurasi Nginx, PHP, dan Apache untuk mendukung upload file besar.
- **Server-Side Pagination**: Seluruh halaman daftar (Submissions, Users, Employees, Approvals, Mobile Apps, Audit Logs) kini menggunakan pagination server-side dengan default 25 item/halaman.
- **Komponen Pagination Reusable**: Komponen `<Pagination>` baru dengan numbered navigation, ellipsis, dan info "Menampilkan X–Y dari Z".
- **Server-Side Search**: Users dan Employees beralih dari filter client-side ke pencarian server-side.

### Diubah

- **UserController, EmployeeController**: `->get()` → `->paginate(25)` + search server-side.
- **MobileAppReleaseController**: Paginated untuk admin view, `->get()` untuk dashboard banner.
- **SubmissionController**: Default `per_page` dari `10` → `25`.
- **ApprovalController** (pending + history): Default `per_page` dari `10` → `25`.
- **AuditTrailController**: Default `per_page` dari `20` → `25`.
- **mobileApps.ts**: `getAll()` mendukung parameter `page` opsional.

### Dokumentasi

- Diperbarui: README, arsitektur sistem, daftar fitur (64 → 70), changelog, dan seluruh backend feature docs.

---

## [2026-03-04] — Draf, Penghapusan, & Manajemen Role

### Ditambahkan

- **Status Draf**: Pengguna dapat menyimpan pengajuan sebagai draf sebelum diterbitkan. Draf bersifat privat dan tidak terlihat oleh approver.
- **Edit Draf**: Draf dapat diubah kapan saja sebelum diterbitkan.
- **Hapus Draf**: Pemilik dapat menghapus draf sendiri (single & bulk delete).
- **Terbitkan Draf**: Draf dapat diterbitkan untuk memulai alur persetujuan dan menghasilkan nomor pengajuan resmi.
- **Warning Publish**: Dialog konfirmasi detail sebelum menerbitkan draf (konsekuensi: read-only, alur approval dimulai).
- **CRUD Role**: Super Admin dapat membuat dan menghapus peran kustom melalui UI.
- **Multi-Role per User**: Pengguna dapat memiliki lebih dari satu peran secara bersamaan.
- **UI Multi-Role**: Form user management diperbarui dari dropdown ke grid multi-select.

### Diubah

- **SubmissionPolicy**: Logika penghapusan diperhalus — owner hanya bisa hapus draf, pengajuan terbit memerlukan permission `delete submissions`.
- **UserController**: `store` dan `update` kini menerima `roles` (array) alih-alih `role` (string tunggal).
- **RolePermissionController**: Ditambahkan method `store` dan `destroy` untuk manajemen Role CRUD.
- **Bulk Delete**: Kini menggunakan policy-based authorization per item, memungkinkan owner menghapus draf mereka sendiri.

### Dokumentasi

- Seluruh dokumentasi dikonsolidasikan ke folder `docs/` dengan struktur terorganisir.
- Ditambahkan katalog fitur lengkap (64 fitur).
- Diperbarui panduan pengguna, arsitektur sistem, dan README.

---

## [2026-03-03] — Implementasi Awal Status Draf

### Ditambahkan

- Kolom `final_status` default `draf` pada tabel `submissions`.
- Endpoint `POST /submissions/{id}/publish` untuk mengirim draf.
- Endpoint `PUT /submissions/{id}` untuk mengedit draf.
- Tombol "Simpan Draf" di form pengajuan (Web & Mobile).
- Tab "Draf" pada daftar pengajuan (Web & Mobile).
- Notifikasi realtime hanya dikirim saat pengajuan diterbitkan, bukan saat disimpan sebagai draf.

---

## [2026-02-xx] — Fitur Inti (Sebelumnya)

### Fitur Dasar

- Manajemen pengajuan (CRUD), approval workflow bertingkat, tanda tangan digital.
- Real-time notification (Laravel Reverb + FCM).
- Dashboard role-based (Staff, Eksekutif, Admin).
- Master Data management, Approval Flow Engine GUI.
- Realisasi & Reporting, Audit Trail.
- Maintenance Mode.
- Mobile app (Flutter) dengan fitur parity.
