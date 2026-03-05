# HBM Budgeting System

Sistem Budgeting & Pengajuan Anggaran untuk PT. HBM.
Aplikasi ini dibangun menggunakan **Laravel 12 (Backend)** dan **Next.js 16 (Frontend)**.

## Fitur Utama

- **Status Draf & Manajemen Draf**: Simpan pengajuan sebagai draf sebelum diterbitkan, dan kelola (edit/hapus) draf pribadi dengan mudah.
- **Sistem Role & Permission Fleksibel**: Dukungan multi-role per user dan manajemen Role CRUD (Create/Read/Update/Delete) oleh Super Admin.
- **Manajemen Pengajuan**: Create, Read, Update, Delete (CRUD) pengajuan anggaran.
- **Approval Workflow**: Persetujuan bertingkat (Manager -> Senior Manager -> Director).
- **Mobile-First Excellence**: Antarmuka premium yang dioptimalkan untuk smartphone (Portrait & Landscape) dengan komponen _glassmorphism_ dan _data-density_ tinggi.
- **Table-to-Card Transformation**: Konversi otomatis tabel data menjadi _card layout_ pada layar kecil untuk kenyamanan navigasi satu tangan.
- **Notifikasi Realtime**: Menggunakan Laravel Reverb & Echo untuk update status instan.
- **Signature Digital**: Tanda tangan digital untuk persetujuan dokumen.
- **Audit Trail**: Pencatatan aktivitas pengguna untuk keamanan dan transparansi.
- **Laporan Realisasi**: Pelacakan penggunaan anggaran per divisi.
- **Mobile App Download**: Super Admin dapat mengunggah file APK/IPA dan mengelola rilis aplikasi mobile. User biasa melihat banner unduh di dashboard.
- **Server-Side Pagination**: Seluruh halaman daftar menggunakan pagination server-side (25 item/halaman) dengan navigasi numbered pagination.

## Prasyarat

- PHP >= 8.2
- Composer
- Node.js >= 20
- MySQL / MariaDB
- Docker & Docker Compose (Recommended)

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd submission_system
```

### 2. Backend Setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Pastikan konfigurasi database di `.env` sudah sesuai.
Untuk menjalankan server WebSocket (Reverb):

```bash
php artisan reverb:start
```

### 3. Frontend Setup (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Aplikasi dapat diakses di `http://localhost:3000`.

### 4. Running with Docker (Recommended)

Pastikan Docker sudah terinstall.

```bash
# 1. Pastikan file .env ada di root dan di dalam folder backend
# Root .env digunakan untuk variabel docker-compose
# Backend .env digunakan untuk koneksi internal laravel

# 2. Build dan Jalankan Container
docker compose up -d --build

# 3. Install Dependencies (Jika vendor belum ada)
docker compose run --rm hbm-app composer install

# 4. Setup Database di dalam Container
docker compose exec hbm-app php artisan migrate --force
docker compose exec hbm-app php artisan key:generate
```

Akses Aplikasi (Single Port 3030):

- Frontend: `http://36.92.42.135:3030`
- Backend API: `http://36.92.42.135:3030/api`
- Reverb WebSocket: `http://36.92.42.135:3030/app` (Proxy via Nginx)

### 5. Konfigurasi Upload Size (Opsional)

Aplikasi mendukung upload file hingga **200MB** (untuk APK/IPA). Konfigurasi ini diatur di:

- **Nginx:** `client_max_body_size 200M` → `docker/nginx/conf.d/app.conf`
- **PHP:** `upload_max_filesize = 200M` → `docker/php/uploads.ini`
- **Apache (reverse proxy):** `LimitRequestBody 209715200` → `/etc/apache2/sites-available/budgeting-system.conf`

## Testing

Untuk menjalankan unit testing backend:

```bash
cd backend
php artisan test
```

## Deployment

Proyek ini dilengkapi dengan konfigurasi CI/CD `github-actions` untuk pengecekan otomatis.
Untuk deployment ke server produksi, lihat dokumentasi teknis di `docs/teknis/panduan_deployment.md`.

## Lisensi

Private - PT. HBM

## Troubleshooting

Jika perubahan pada frontend tidak terlihat:

1.  **Rebuild Container**:
    ```bash
    docker-compose down
    docker-compose up -d --build
    ```
2.  **Clear Cache (Without Docker)**:
    ```bash
    rm -rf .next
    npm run build
    npm start
    ```
