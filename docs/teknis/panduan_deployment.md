# Panduan Teknis & Deployment - HBM Budgeting System

Dokumen ini ditujukan untuk **IT Administrator** atau **Developer** yang bertanggung jawab atas pengelolaan server dan deployment aplikasi.

---

## 1. Arsitektur Sistem

Aplikasi ini menggunakan arsitektur modern terpisah (Decoupled Architecture):

- **Backend API**: Laravel 11 (PHP 8.2) + MySQL
- **Frontend SPA**: Next.js 16 (Node.js 20+)
- **Realtime Server**: Laravel Reverb (WebSocket)

Komunikasi antara Frontend dan Backend menggunakan REST API dan WebSocket (Channel Private).

---

## 1.1 Mobile-First Ergonomics

Aplikasi ini menggunakan pendekatan **Mobile-First Excellence** dengan fokus pada:

- **Responsive Card Layouts**: Transformasi otomatis dari tabel data kompleks menjadi kartu informasi yang padat (high-density) pada layar smartphone.
- **Visual Analytics (Mobile)**: Implementasi grafik interaktif menggunakan `fl_chart` untuk memberikan wawasan cepat bagi level Management.
- **Aggressive Typography Scaling**: Penggunaan ukuran font spesifik (`9px` - `11px`) untuk metadata agar informasi maksimal tetap terlihat tanpa scroll berlebihan.
- **Landscape Optimization**: Penyesuaian viewport khusus untuk mode landscape smartphone guna menjaga visibilitas menu navigasi.

---

## 2. Persyaratan Server (Production)

### Spesifikasi Minimum:

- **OS**: Linux (Ubuntu 22.04 LTS Recommended) atau Windows Server
- **CPU**: 2 Core
- **RAM**: 4 GB (Disarankan 8 GB untuk build frontend)
- **Storage**: 50 GB SSD

### Software Requirement:

1. **Web Server**: Nginx atau Apache (Nginx Recommended untuk Reverse Proxy)
2. **Database**: MySQL 8.0 atau MariaDB 10.6
3. **PHP**: Versi 8.2+ (Extension: bcmath, ctype, fileinfo, json, mbstring, openssl, pdo_mysql, tokenizer, xml)
4. **Node.js**: Versi 18 atau 20 LTS
5. **Supervisor**: Untuk menjalankan worker queue dan Reverb

---

## 3. Langkah Instalasi (Linux/Ubuntu)

### A. Backend (Laravel)

1. **Clone & Install Dependencies**

   ```bash
   git clone <repo_url>
   cd backend
   composer install --optimize-autoloader --no-dev
   ```

2. **Environment Configuration**
   - Salin `.env.example` ke `.env`
   - Atur Database Credential
   - Atur `APP_URL` ke domain backend (misal: `https://api.budget.hbm.co.id`)
   - Atur Reverb Config:
     ```ini
     REVERB_APP_ID=my-app-id
     REVERB_APP_KEY=my-app-key
     REVERB_APP_SECRET=my-app-secret
     REVERB_HOST="0.0.0.0"
     REVERB_PORT=8080
     REVERB_SCHEME=https
     ```

3. **Database Migration**

   ```bash
   php artisan migrate --force
   php artisan db:seed --class=RolePermissionSeeder
   ```

4. **Permissions**
   Pastikan folder `storage` dan `bootstrap/cache` writable oleh web server user (`www-data`).

### B. Frontend (Next.js)

1. **Install & Build**

   ```bash
   cd frontend
   npm ci
   cp .env.example .env.local
   # Update NEXT_PUBLIC_API_URL dan NEXT_PUBLIC_REVERB_HOST
   npm run build
   ```

2. **Running with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "hbm-frontend" -- start
   ```

---

## 4. Konfigurasi Supervisor (Queue & Reverb)

Buat file `/etc/supervisor/conf.d/hbm-worker.conf`:

```ini
[program:hbm-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2

[program:hbm-reverb]
command=php /path/to/backend/artisan reverb:start
autostart=true
autorestart=true
user=www-data
```

[program:hbm-reverb]
command=php /path/to/backend/artisan reverb:start
autostart=true
autorestart=true
user=www-data

````

---

## 5. Deployment dengan Docker (Alternative)

Jika menggunakan Docker, proses deployment jauh lebih sederhana.

### Struktur Container
- **App**: PHP 8.2 FPM (Backend Logic)
- **Webserver**: Nginx (Reverse Proxy & Static Files)
- **DB**: MySQL 8.0
- **Reverb**: WebSocket Server
- **Frontend**: Next.js (Standalone Build)

### Langkah Deployment

1. **Persiapan Server**
   Pastikan Docker dan Docker Compose terinstall. Pastikan juga disk eksternal telah di-*mount*, contohnya untuk menyimpan lampiran ke `/mnt/raw-backup/app_data_storage`.

2. **Konfigurasi Lingkungan (Env & Bind Mounts)**
   - Salin `.env.example` ke `.env` di folder backend dan atur kredensial database (`DB_HOST=db`).
   - Buat struktur folder di disk ekstermal (opsional jika root permission mengatur otomatis):
     ```bash
     mkdir -p /mnt/raw-backup/app_data_storage/submission_attachments
     mkdir -p /mnt/raw-backup/app_data_storage/mobile_app_releases
     ```

   **Catatan Port (Mencegah Konflik):**
   - Frontend: **3030**
   - Backend/API: **8065**
   - Reverb: **8066**
   - Database (Host): **3309**

   Pastikan port tersebut tidak digunakan oleh service lain di server.

3. **Jalankan Aplikasi**
   ```bash
   docker-compose up -d --build
````

4. **Initial Setup (Pertama Kali)**
   ```bash
   docker-compose exec app composer install
   docker-compose exec app php artisan migrate --seed
   docker-compose exec app php artisan key:generate
   docker-compose exec app php artisan storage:link
   ```

---

## 6. Troubleshooting Umum

### WebSocket Gagal Terhubung

- **Gejala**: Error connection di console browser.
- **Solusi**:
  1. Pastikan port 6001 (atau 8080) terbuka di Firewall.
  2. Cek apakah Reverb service berjalan (`sudo supervisorctl status`).
  3. Pastikan `NEXT_PUBLIC_REVERB_HOST` di frontend mengarah ke IP/Domain server yang benar, bukan `localhost`.

### Error 500 saat Upload

- **Penyebab**: Limit upload file PHP terlalu kecil.
- **Solusi**: Edit `php.ini`, set `upload_max_filesize = 10M` dan `post_max_size = 12M`.

### Tampilan Berantakan

- **Penyebab**: Asset CSS tidak termuat atau build error.
- **Solusi**: Jalankan ulang `npm run build` dan restart PM2.

---

## 7. Cara Update Aplikasi (Maintenance)

Jika ada pembaruan kode di repositori GitHub, ikuti langkah ini untuk memperbarui aplikasi di server:

### Langkah-langkah Update:

1. **Masuk ke folder project**

   ```bash
   cd submission_system
   ```

2. **Tarik kode terbaru (Git Pull)**

   ```bash
   git pull origin main
   ```

3. **Rebuild & Restart Container**

   ```bash
   # --build memastikan Docker mendeteksi perubahan Dockerfile atau kode frontend
   docker-compose up -d --build
   ```

4. **Update Database (Jika ada migrasi baru)**

   ```bash
   docker-compose exec hbm-app php artisan migrate --force
   ```

5. **Optimalisasi (Opsional)**
   ```bash
   docker-compose exec hbm-app php artisan config:cache
   docker-compose exec hbm-app php artisan route:cache
   ```

---

## 8. Backup & Maintenance

Disarankan melakukan **Backup Database Harian** menggunakan cron job:

```bash
0 2 * * * mysqldump -u user -p'password' hbm_budgeting > /backup/db_$(date +\%F).sql
```
