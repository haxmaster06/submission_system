# Deskripsi Proyek: HBM Budgeting System

Dokumen ini mendeskripsikan secara lengkap dan mendetail mengenai arsitektur, teknologi, database, dan fitur-fitur dari proyek HBM Budgeting System saat ini.

---

## 1. Arsitektur Sistem

HBM Budgeting dibangun menggunakan arsitektur **Monolithic Backend / Decoupled Frontend**.

- **Backend (API Provider):** Bertugas sebagai _Single Source of Truth_. Mengelola business logic, database, autentikasi, otorisasi (Role-Based Access Control/RBAC), validasi, manajemen file, dan notifikasi (WebSocket & Web Push).
- **Frontend (Web App):** Berjalan secara independen (SPA/SSR architecture) dan berinteraksi dengan backend murni melalui REST API (menggunakan JSON payload dan Bearer Token). UI dirender menggunakan komponen modern yang terisolasi.
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

### Frontend

- **Framework:** Next.js 14+ (App Router) dengan React
- **Styling:** Tailwind CSS
- **Animasi:** Framer Motion
- **Iconography:** Lucide React
- **HTTP Client:** Axios (dengan custom interceptors untuk handling error 401 dan 503)
- **State & Data Fetching:** React Hooks (`useState`, `useEffect`, `useCallback`)
- **Notification Client:** Firebase JavaScript SDK & Laravel Echo / Pusher-js

---

## 3. Fitur Utama (Features)

Sistem ini dirancang untuk mendigitalisasi proses pengajuan dana/anggaran (Cash Advance & Reimbursement), hingga realisasi dan approval berjenjang.

### A. Fitur Modul Pengajuan (Submissions)

- **Create Submission:** Pengguna dapat membuat dokumen pengajuan dengan mengisi meta data (jenis, kategori, urgensi, tanggal) dan menambahkan banyak _Item Details_ sekaligus.
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

- **Master Data Management:** Pengelolaan tabel-tabel refrensi (Division, Jenis Pengajuan, Jenis Perjalanan, Satuan/UOM, Status Urgensi), dapat dikelola via UI Admin.
- **Flow Engine GUI:** Antarmuka khusus untuk mengatur logika routing persetujuan (contoh: _Jika uang > Rp5.000.000, maka butuh approval Direktur_).

### E. Fitur Notifikasi & Log

- **Real-Time In-App Notif:** Menangkap _event_ persetujuan/pengajuan baru via WebSockets dan memunculkan _toast_ langsung di layar tanpa refresh.
- **Web Push (FCM):** Mengirimkan notifikasi ke _system OS_ meski tab browser ditutup (Push Notification).
- **Audit Trails:** Halaman khusus Super Admin yang mencatat seluruh riwayat aktivitas mutasi data dalam sistem (Action, Model, User, Timestamp, Old/New payload).

### F. Fitur Global & Sistem

- **Maintenance Mode:** Layar blokade global yang dapat diaktifkan oleh Super Admin (menghentikan akses seluruh user biasa / HTTP 503).
- **Role-Based Dashboard:**
  - _Staff:_ Melihat antrean dokumen mereka & statistik pribadi.
  - _Manager/Director:_ Melihat antrean tugas _Approval Task_ yang menunggu tindakan mereka.
  - _Super Admin:_ Melihat rekapitulasi performa global (Total Budget, Top Divisi, Users Aktif).

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
