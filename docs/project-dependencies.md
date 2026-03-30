# Daftar Plugin dan Dependensi Project (HBM Budgeting System)

Dokumen ini berisi daftar seluruh plugin pihak ketiga (*third-party packages*) yang terinstal di dalam ekosistem HBM Budgeting System, baik di sisi Frontend (Next.js) maupun Backend (Laravel), beserta penjelasan peran dan fungsinya masing-masing.

---

## 🖥️ Frontend (Next.js / React)
Daftar plugin yang terinstal di `frontend/package.json`:

### 1. Core Framework & UI
- **`next` (v16.1.6)**: Framework utama yang digunakan untuk me-render antarmuka pengguna berbasis React. Digunakan dengan mode *App Router*.
- **`react` & `react-dom` (v19.2.3)**: Library utama untuk membangun komponen antarmuka pengguna (UI).

### 2. Styling & Animasi
- **`tailwindcss` (v4)**: Framework CSS utama untuk mengatur desain sistem (*styling*).
- **`clsx` & `tailwind-merge`**: Digunakan bersamaan untuk menggabungkan *class* Tailwind secara dinamis tanpa bentrok (*conflict*). Sangat berguna di komponen UI kustom.
- **`framer-motion`**: Library animasi tingkat tinggi untuk React. Digunakan untuk membuat transisi halaman, efek menu *dropdown*, animasi *loading* progress bar, dan *micro-interactions* yang sangat mulus.
- **`lucide-react`**: Library kumpulan ikon vektor (SVG) ringan dan elegan yang dipakai di seluruh antarmuka aplikasi.

### 3. Komunikasi Data & Real-time
- **`axios`**: *HTTP Client* tangguh untuk mengirim *request* API dari Frontend ke Backend Laravel (mendukung *interceptor*, *auth token*, dan sistem *chunked upload*).
- **`laravel-echo`**: Bertugas menangkap (*listen*) event *real-time* yang disiarkan oleh server.
- **`pusher-js`**: *Engine* koneksi WebSocket yang bekerja di bawah `laravel-echo` untuk menyambung langsung ke **Laravel Reverb**.

### 4. Fitur Spesifik
- **`firebase`**: SDK Firebase untuk *client-side*. Digunakan untuk mengelola Token FCM (*Firebase Cloud Messaging*) agar browser/perangkat dapat menerima Push Notification.
- **`recharts`**: Library pembuat grafik (*chart*) berbasis React. Digunakan pada halaman Dashboard untuk menampilkan statistik anggaran interaktif (seperti Pie Chart dan Bar Chart).
- **`react-dropzone`**: Plugin UI berkelas premium untuk membuat area *Drag-and-Drop* (Tarik & Lepas) pada halaman *Upload* APK Mobile Apps.

---

## ⚙️ Backend (Laravel / PHP)
Daftar plugin penting yang terinstal di `backend/composer.json`:

### 1. Core Framework & Keamanan
- **`laravel/framework` (v12.0)**: *Engine* utama kerangka kerja backend (API, routing, ORM, database).
- **`laravel/sanctum`**: Bertugas mengelola keamanan Autentikasi API. Menghasilkan *Bearer Token* yang dipakai saat *login* dan membatasi akses endpoint tertentu (SPA & Mobile API Auth).

### 2. Otorisasi (Hak Akses)
- **`spatie/laravel-permission`**: Plugin standar industri untuk mendefinisikan *Role* (Peran seperti Admin, Manager) dan *Permission* (Hak akses spesifik) di Laravel. Plugin ini secara otomatis memeriksa apakah user boleh mengakses module pengajuan tertentu.

### 3. Sistem Push Notification & Real-time
- **`laravel/reverb` (v1.7)**: *WebSocket server* resmi bawaan Laravel generasi terbaru (pengganti Pusher). Sangat kencang untuk men-skalakan event *real-time* langsung dari server Anda sendiri.
- **`kreait/firebase-php` & `google/auth`**: SDK resmi Firebase untuk sisi server. Bertugas men- *trigger* / mengirim notifikasi ke aplikasi seluler (Android/iOS) menggunakan infrastruktur FCM.
- **`minishlink/web-push`**: Plugin khusus penanganan fitur *Push Notification* lintas browser web tanpa bergantung pada layanan Firebase.

### 4. Generator & Utilitas Opsional
- **`barryvdh/laravel-dompdf`**: Plugin untuk memproses kode HTML dan halaman web lalu mengubahnya menjadi file dokumen PDF (berguna untuk fitur `Export to PDF` pada Pengajuan/Laporan).
- **`dedoc/scramble`**: Secara ajaib membaca *source-code*, komentar, dan rute Laravel, lalu men- *generate* Dokumentasi API interaktif berformat OpenAPI (Swagger) secara otomatis tanpa disuruh.

---

> *Dokumen ini di-generate otomatis pada: 28 Maret 2026 berdasarkan analisis package internal HBM Budgeting System.*
