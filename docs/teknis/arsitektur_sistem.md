# Deskripsi Proyek: HBM Budgeting System

Dokumen ini mendeskripsikan secara lengkap dan mendetail mengenai arsitektur, teknologi, database, dan fitur-fitur dari proyek HBM Budgeting System saat ini.

---

## 1. Arsitektur Sistem

HBM Budgeting dibangun menggunakan arsitektur **Monolithic Backend / Decoupled Frontend**.

- **Backend (API Provider):** Bertugas sebagai _Single Source of Truth_. Mengelola business logic, database, autentikasi, otorisasi (Role-Based Access Control/RBAC), validasi, manajemen file, dan notifikasi (WebSocket & Web Push).
- **Frontend (Web App):** Berjalan secara independen (Next.js 14+) dan berinteraksi dengan backend murni melalui REST API (menggunakan JSON payload dan Bearer Token). UI dirender menggunakan komponen modern (Tailwind & Framer Motion).
- **Mobile Mobile (Android/iOS):** Dikembangkan menggunakan **Flutter** dengan state management Riverpod. Mempertahankan parity fitur dengan web dan memiliki optimasi visual khusus untuk layar kecil.
- **Micro-services / Integrations:** Menggunakan Firebase Cloud Messaging (FCM) untuk push notification external dan Reverb untuk real-time internal notification (WebSocket).

---

## 2. Tech Stack

### Backend

- **Framework:** Laravel 11.x (PHP 8.2)
- **Database:** MySQL 8.0
- **Autentikasi API:** Laravel Sanctum (Token-Based Stateless Auth)
- **Otorisasi (RBAC):** Spatie Laravel Permission
- **Real-time WebSockets:** Laravel Reverb & Laravel Echo
- **Push Notification:** Firebase Cloud Messaging (FCM) via kreait/firebase-php
- **PDF Generation:** Barryvdh/laravel-dompdf
- **Environment:** Docker & Docker Compose (Containerized deployment)

### Frontend & Mobile

- **Web:** Next.js 14+ (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
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
