# HBM Submission System: Multi-Company (Multi-Tenant) Migration Plan

**Diperbarui pada:** 30 Maret 2026
**Target Audiens:** Junior Backend/Frontend Developer, Sistem AI Agent (System Prompting).
**Arsitektur Terpilih:** Single Database, Shared Schema (Satu database utama, dipisahkan oleh kolom `company_id`).

Dokumen ini berisi langkah-langkah *sequential* (berurutan) dan terperinci untuk mengubah sistem skala *single-company* menjadi *multi-company*. Ikuti fase ini secara berurutan agar sistem tidak *break/error* di tengah jalan.

---

## FASE 1: Persiapan Database (Schema Alteration)
Tujuan: Membuat struktur dasar perusahaan (Company) dan mengaitkan tabel-tabel lama ke perusahaan tersebut.

1.  **Buat Tabel `companies`**
    *   **Deskripsi:** Simpan entitas perusahaan.
    *   **Kolom (Migration):** `id`, `name`, `code` (unik), `logo_path`, `address`, `npwp`, `is_active` (boolean), `created_at`, `updated_at`.
2.  **Tambahkan Kolom `company_id` ke Tabel Utama**
    *   **Deskripsi:** Injeksi *Foreign Key* ke tabel yang relevan.
    *   **Tabel Target:** `users`, `divisions`, `jenis_pengajuans`, `jenis_perjalanans`, `uoms`, `approval_flows`, `approval_flow_steps`, `approval_flow_conditions`, `submissions`, `submission_items`, `submission_approvals`, `submission_attachments`, `realization_headers`.
    *   **Penting:** Pada tahap awal migrasi, buat kolom ini `nullable`. Jangan di-set `constrained()` dulu agar data lama tidak *error*.
3.  **Data Seeder Awal (Data Cleansing & Legacy Support)**
    *   **Tugas:** Buat sebuah seeder khusus (`LegacyDataMigrationSeeder`).
    *   **Logika:**
        1. Buat satu data `companies` (Misal: "HBM Default Company").
        2. *Update* SEMUA data di tabel target (poin 2) massal (`UPDATE table SET company_id = X WHERE company_id IS NULL`).
    *   Setelah semua terisi, buat migrasi baru untuk mengubah `company_id` menjadi `nullable(false)` dan tambahkan `foreign()` key constraint.

---

## FASE 2: Layer Backend Laravel (Isolasi Data)
Tujuan: Memastikan query ke database selalu difilter otomatis agar data perusahaan A tidak terlihat oleh perusahaan B.

1.  **Buat Trait `BelongsToCompany`**
    *   **Lokasi:** `app/Traits/BelongsToCompany.php`
    *   **Logika:** Di dalam metode `bootBelongsToCompany()`, tambahkan *Global Scope*.
    *   **Contoh Kode (untuk AI / Junior Dev):**
        ```php
        static::addGlobalScope('company', function (Builder $builder) {
            if (auth()->check() && auth()->user()->company_id) {
                $builder->where('company_id', auth()->user()->company_id);
            }
        });
        ```
    *   *Catatan:* Event `creating` pada Trait ini juga harus otomatis mengisi `$model->company_id = auth()->user()->company_id` saat ada data baru di-insert.
2.  **Terapkan Trait ke Seluruh Model**
    *   Gunakan trait ini pada model `User`, `Division`, `Submission`, `MasterData`, dll.
3.  **Pertimbangkan Model Global vs Spesifik**
    *   Pengecualian: Model `Role` dan `Permission` (Spatie) biasanya dibuat global kecuali desain mengharuskan role berbeda per perusahaan.
    *   Jika Super Admin butuh melihat semua data, kita sediakan metode khusus `withoutGlobalScope('company')`.

---

## FASE 3: Autentikasi & Konteks User
Tujuan: Pastikan backend tahu perusahaan mana yang sedang diakses user.

1.  **Modifikasi Autentikasi Login (Token)**
    *   Jika memakai model *Multi-Company Access* (Satu user bisa jadi member di banyak perusahaan), kita butuh tabel pivot `company_user`.
    *   Namun, jika 1 User hanya milik 1 Company (lebih mudah), cukup gunakan kolom `company_id` di tabel `users`.
2.  **Middleware / Request Header (Opsional namun Kuat)**
    *   Buat Middleware `EnsureCompanyContext`.
    *   Setiap request API dari FE harus menyertakan header `X-Company-ID` bila user bekerja multi-perusahaan. Jika 1-user-1-company, gunakan `$user->company_id` dari token Sanctum.
3.  **Super Admin Bypass**
    *   Jika role = `Super Admin`, abaikan *Global Scope* saat ia mengakses halaman *dashboard management*.

---

## FASE 4: Validasi & Controller (API)
Tujuan: Mencegah relasi "silang" antar perusahaan.

1.  **Validasi Foreign Keys (Form Requests)**
    *   Setiap *rules* validasi basis data (seperti `exists:divisions,id`) harus ditambahkan *closure* untuk mengecek `company_id`.
    *   **Contoh (Validation Rule):** User mencoba membuat pengajuan dengan `division_id = 5`. Sistem tidak hanya mengecek id 5 ada, tapi id 5 juga harus memiliki `company_id` yang sama dengan user yang request.
2.  **Membersihkan Kode Controller**
    *   Karena kita sudah menggunakan *Global Scopes* di Fase 2, pada dasarnya `Submission::all()` sudah aman. Namun, ketika menggunakan relasi `user()`, `division()`, `items()`, pastikan query berjalan sinkron tanpa kendala.

---

## FASE 5: Pemisahan Direktori Penyimpanan (Storage)
Tujuan: Keamanan file fisik server.

1.  **Update Service Upload & Tanda Tangan**
    *   **Target:** `SubmissionController::uploadAttachment`, signature upload, dan PDF Export.
    *   **Rule:** Simpan file di dalam sub-direktori dengan nama direktori alias/kode perusahaan.
    *   *Sebelumnya:* `storage/app/public/submissions/...`
    *   *Sesudahnya:* `storage/app/public/perusahaan_a/submissions/...`

---

## FASE 6: Penyesuaian Frontend (Next.js / React)
Tujuan: Tampilan Visual menyesuaikan Multi-Tenancy.

1.  **Konteks Global (State Management)**
    *   Simpan objek `currentCompany` di Context/Redux. Objek ini berisi `id`, `name`, `logo_path`.
2.  **Dinamisasi Logo dan Tema (Opsional)**
    *   Pada komponen `Sidebar` atau `Header`, tampilkan logo perusahaan dari state `currentCompany`.
3.  **Dropdown Pemilih Perusahaan (Bila User Akses > 1 Company)**
    *   Taruh di Navbar: Sebuah Dropdown untuk switch konteks `company_id`. Saat dipilih, kirim request `/api/auth/switch-company` atau simpan di *local storage* lalu refresh data seluruh halaman.

---

## FASE 7: Verifikasi dan Integrasi Deployment
1. Jalankan `php artisan migrate:fresh --seed` (Di environment development).
2. Uji Coba:
   * Login sebagai User Perusahaan A: Buat divisi, buat pengajuan.
   * Login sebagai User Perusahaan B: Pastikan divisi A, dan pengajuan A **tidak terlihat** sama sekali.
   * Uji coba fungsi PDF Export, lampiran—pastikan link gambar/file tidak *broken*.

---
*(Dokumen ini dibuat khusus agar bisa langsung dibaca dan dipahami oleh AI Agent di sesi tugas berikutnya, serta dapat dipelajari oleh developer manusia kapan saja.)*
