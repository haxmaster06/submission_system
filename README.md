# HBM Budgeting System

Sistem Budgeting & Pengajuan Anggaran untuk PT. HBM.
Aplikasi ini dibangun menggunakan **Laravel 11 (Backend)** dan **Next.js 14 (Frontend)**.

## Fitur Utama

- **Manajemen Pengajuan**: Create, Read, Update, Delete (CRUD) pengajuan anggaran.
- **Approval Workflow**: Persetujuan bertingkat (Manager -> Senior Manager -> Director).
- **Notifikasi Realtime**: Menggunakan Laravel Reverb & Echo untuk update status instan.
- **Signature Digital**: Tanda tangan digital untuk persetujuan dokumen.
- **Audit Trail**: Pencatatan aktivitas pengguna untuk keamanan dan transparansi.
- **Laporan Realisasi**: Pelacakan penggunaan anggaran per divisi.

## Prasyarat

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL / MariaDB

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd hbm_budgeting_system
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

## Testing

Untuk menjalankan unit testing backend:

```bash
cd backend
php artisan test
```

## Deployment

Proyek ini dilengkapi dengan konfigurasi CI/CD `github-actions` untuk pengecekan otomatis.
Untuk deployment ke server produksi, lihat dokumentasi teknis di `docs/end_user/panduan_teknis.md`.

## Lisensi

Private - PT. HBM
