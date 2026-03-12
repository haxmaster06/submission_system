# Deskripsi Proyek: HBM Budgeting System

Dokumen ini mendeskripsikan secara lengkap dan mendetail mengenai arsitektur, teknologi, database, dan fitur-fitur dari proyek HBM Budgeting System saat ini.

---

## 1. Arsitektur Sistem

HBM Budgeting dibangun menggunakan arsitektur **Monolithic Backend / Decoupled Frontend**.

- **Backend (API Provider):** Bertugas sebagai _Single Source of Truth_. Mengelola business logic, database, autentikasi, otorisasi (Role-Based Access Control/RBAC), validasi, manajemen file, dan notifikasi (WebSocket & Web Push).
- **Frontend (Web App):** Berjalan secara independen (Next.js 16+) dan berinteraksi dengan backend murni melalui REST API (menggunakan JSON payload dan Bearer Token). UI dirender menggunakan komponen modern (Tailwind & Framer Motion).
- **Mobile Mobile (Android/iOS):** Dikembangkan menggunakan **Flutter** dengan state management Riverpod. Mempertahankan parity fitur dengan web dan memiliki optimasi visual khusus untuk layar kecil.
- **Micro-services / Integrations:** Menggunakan Firebase Cloud Messaging (FCM) untuk push notification external dan Reverb untuk real-time internal notification (WebSocket).

---

## 2. Tech Stack

### Backend

- **Backend:** Laravel 12.x (PHP 8.2)
- **Database:** MySQL 8.0
- **Storage:** Local Disk Storage dengan Docker Bind Mounts ke `/mnt/raw-backup` untuk memisahkan app logic dan persisten data media besar.
- **Autentikasi API:** Laravel Sanctum (Token-Based Stateless Auth)
- **Otorisasi (RBAC):** Spatie Laravel Permission
- **Real-time WebSockets:** Laravel Reverb & Laravel Echo
- **Push Notification:** Firebase Cloud Messaging (FCM) via kreait/firebase-php
- **PDF Generation:** Barryvdh/laravel-dompdf
- **Environment:** Docker & Docker Compose (Containerized deployment)

### Frontend & Mobile

- **Web:** Next.js 16+ (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Mobile:** Flutter (Dart), Riverpod (State Management), Dio (HTTP), GoRouter.
- **Charts:** `fl_chart` (Mobile) & Native Chart logic (Web) untuk visualisasi data analitis.
- **Notification Client:** Firebase SDK & Laravel Echo / Pusher-js.

---

## 3. Fitur Utama (Features)

Sistem ini dirancang untuk mendigitalisasi proses pengajuan dana/anggaran (Cash Advance & Reimbursement), hingga realisasi dan approval berjenjang.

### A. Fitur Modul Pengajuan (Submissions)

- **Drafting & Editing:** Pengguna dapat menyimpan pengajuan sebagai draf. Draf bersifat privat (hanya terlihat oleh pemilik) dan dapat diubah atau dihapus kapan saja sebelum diterbitkan.
- **Create & Publish:** Pengajuan yang sudah siap dapat "Diterbitkan", yang kemudian memulai alur persetujuan dan menghasilkan nomor pengajuan resmi.
- **Attachment Upload:** Mendukung unggah banyak file bukti (PDF/Images) per pengajuan.
- **PDF Generation & Export:** Menghasilkan formulir PDF berstandar perusahaan yang memuat nominal, tabel item, nomor unik, dan tanda tangan digital.
- **Dynamic Approval Routing:** Saat pengajuan dikirim, sistem secara otomatis mengevaluasi _Approval Flow Conditions_ (berdasarkan Role, Jumlah Dana, dsb) untuk menentukan siapa saja yang harus menyetujui dokumen ini secara berurutan.

### B. Fitur Otorisasi dan Persetujuan (Approvals)

- **Multi-Level Approval:** Dokumen harus disetujui secara berurutan (Step 1 -> Step 2 -> dst). Approver selanjutnya tidak akan ternotifikasi sebelum approver sebelumnya menyetujui.
- **Digital Signatures:** Saat user (Approver) menyetujui dokumen, gambar tanda tangan mereka secara otomatis dibubuhkan ke dalam status log dan ekspor PDF.
- **Super Admin Proxy (Override):** Super Admin memiliki wewenang untuk melihat seluruh dokumen dan memberikan _Approval Override_ (menyetujui atas nama user lain).

### C. Fitur Modul Realisasi (Realizations)

- Setelah sebuah pengajuan berstatus `Approved` dan dana cair, Staff wajib mengunggah _Realisasi_ (laporan uang keluar aktual).
- Sistem membandingkan nilai pengajuan vs nilai realisasi untuk audit sisa budget.

### D. Fitur Master Data & Konfigurasi

- **Role & Permission Management (GUI):** Super Admin dapat membuat peran baru, menghapus peran kustom, dan mengatur hak akses (permissions) secara detail melalui antarmuka matriks.
- **Multi-Role Support:** Sistem mendukung penugasan banyak peran pada satu pengguna (User inherits all permissions from assigned roles).
- **Master Data Management:** Pengelolaan tabel-tabel refrensi (Division, Jenis Pengajuan, Jenis Perjalanan, Satuan/UOM, Status Urgensi), dapat dikelola via UI Admin.
- **Flow Engine GUI:** Antarmuka khusus untuk mengatur logika routing persetujuan (contoh: _Jika uang > Rp5.000.000, maka butuh approval Direktur_).

### E. Fitur Notifikasi & Log

- **Real-Time In-App Notif:** Menangkap _event_ persetujuan/pengajuan baru via WebSockets dan memunculkan _toast_ langsung di layar tanpa refresh.
- **Web Push (FCM):** Mengirimkan notifikasi ke _system OS_ meski tab browser ditutup (Push Notification).
- **Audit Trails:** Halaman khusus Super Admin yang mencatat seluruh riwayat aktivitas mutasi data dalam sistem (Action, Model, User, Timestamp, Old/New payload).

### F. Fitur Global & Sistem

- **Maintenance Mode:** Layar blokade global yang dapat diaktifkan oleh Super Admin (menghentikan akses seluruh user biasa / HTTP 503).
- **Role-Based Dynamic Dashboard (Web & Mobile):**
  - _Staff:_ Melihat antrean dokumen pribadi, statistik pencairan, dan riwayat aktivitas.
  - _Manager/Director:_ Dashboard eksekutif dengan grafik tren anggaran, analisis kategori pengajuan (Pie Chart), dan ranking pengeluaran antar divisi.
  - _Finance:_ Memiliki akses spesifik ke pelaporan (Reporting) dan dashboard analitis serupa dengan Director.
  - _Super Admin:_ Rekapitulasi sistem global, audit logs, dan manajemen user.

### G. Fitur Mobile App Download

- **Manajemen Rilis Aplikasi:** Super Admin dapat mengunggah file installer (APK/IPA) dengan metadata (platform, versi, deskripsi, nama file custom).
- **Active Release Logic:** Hanya satu rilis aktif per platform (Android/iOS), dikelola otomatis oleh backend.
- **Download Banner:** Dashboard user menampilkan banner unduh untuk rilis aktif.
- **API Routes:** CRUD di `/mobile-apps`, download di `/mobile-apps/download/{id}`.
- **Upload Limit:** Mendukung file hingga 200MB melalui konfigurasi Nginx, PHP, dan Apache.

### H. Fitur Pagination

- **Server-Side Pagination:** Seluruh halaman daftar (Submissions, Users, Employees, Approvals, Mobile Apps, Audit Logs) menggunakan pagination server-side.
- **Default 25 Item/Halaman:** Semua endpoint paginated menggunakan default `per_page=25`.
- **Reusable UI Component:** Komponen `<Pagination>` di frontend menampilkan navigasi bernomor (Prev, 1, 2, …, Next) dan info "Menampilkan X–Y dari Z".
- **Search Server-Side:** Halaman Users dan Employees menggunakan pencarian server-side untuk mengurangi beban data transfer.

---

## 4. Struktur Basis Data (Core ERD Overview)

- **`users`**: Data authn/authz, berelasi dengan tabel `divisions` dan tabel `roles` (Spatie). Meyimpan `signature_path` (Gambar ttd) dan `telegram_chat_id` (Rencana).
- **`submissions`**: Header pengajuan (Nomor unik, Grand Total, Catatan, Final Status).
- **`submission_items`**: (_One-to-Many_ dari Submissions). Baris-baris detail pembelanjaan / kebutuhan anggaran.
- **`submission_approvals`**: (_One-to-Many_ dari Submissions). Logika _State Machine_. Menyimpan history siapa saja yang harus setuju, status masing-masing approver, catatan penolakan, urutan (step_order).
- **`realization_headers` & `realization_details`**: Serupa strukturnya dengan Submissions, namun menunjuk sebagai bukti real aktual _post-approval_.
- **`approval_flows` & `approval_conditions`**: Tabel rule-engine, memetakan Rule A -> Harus di-approve oleh Role B.
- **`audit_trails`**: Tabel append-only (No Delete/Update), merekam semua _lifecycle_ model.
- **`fcm_tokens`**: Menyimpan token spesifik device milik user untuk target blasting Push Notification.
- **`mobile_app_releases`**: Menyimpan data rilis aplikasi mobile (platform, version, filename, file_path, description, is_active). Dikelola oleh Super Admin.
