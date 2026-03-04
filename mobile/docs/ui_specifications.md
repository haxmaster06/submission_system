# Spesifikasi UI Mobile App (HBM Submission System)

Dokumen ini berisi penjelasan detail mengenai alur (_flow_), struktur layar, area fungsional, komponen data pendukung, dan interaksi pengguna pada aplikasi Mobile HBM Submission System berbasis Flutter.

Dokumen ini dirancang sebagai landasan (konteks) agar AI _UI Generator_ (misalnya Stitch AI) dapat melakukan _redesign_ antarmuka pengguna (UI/UX) menjadi lebih modern, responsif, dan _user-friendly_, tanpa merombak _business logic_ atau struktur _backend_-nya.

---

## Arsitektur Navigasi Utama (Main Navigation)

Sistem menggunakan **Persistent Bottom Navigation Bar** (`lib/shared/widgets/main_wrapper.dart`) yang membungkus 4 menu utama. Jumlah menu bersifat dinamis berdasarkan _Role/Jabatan_ _user_ yang aktif login.

- **Global Routes:** `/login`, `/maintenance`.
- **Protected Routes:** `/dashboard`, `/submissions`, `/approvals`, `/profile`.
- **Hak Akses:** Tab **Approval (Persetujuan)** hanya disisipkan jika `user.roleName` memiliki wewenang (seperti `Super Admin`, `Manager`, `Director`, `Finance`, `GM`). Jika user merupakan `Staff` biasa, maka navigasi bawah hanya berisi 3 tab.

---

## 1. Area Autentikasi (Login Area)

**Path Konten Utama:** `lib/features/auth/views/login_screen.dart`

**Tujuan Fungsional:**
Layar gerbang masuk bagi seluruh jenis pengguna (_Super Admin, Manager, Staff, dsb._).

**Komponen UI Prioritas Redesign:**

- **Header/Branding:** Menampilkan logo perusahaan atau ilustrasi yang estetik dan representatif di separuh bagian atas layar.
- **Form Login:** Membutuhkan _Textfield_ untuk NIK (Nomor Induk Karyawan/Email) dan Password, serta _Checkbox_ untuk fitur **"Stay Login / Remember Me"** (agar user tidak perlu bolak-balik login setiap membuka aplikasi). Posisikan _form_ agar terhindar dari ketertutupan _keyboard_ bawaan HP (_no auto scroll issues_).
- **Primary Call to Action (CTA):** Tombol "Masuk" yang menonjol dan menampilkan _loading indicator_ ketika proses API _authentication_ (`ref.read(authProvider.notifier).login()`) sedang berjalan.

---

## 2. Area Beranda (Dashboard Area)

**Path Konten Utama:** `lib/features/dashboard/views/dashboard_screen.dart`, `lib/shared/widgets/dashboard_widgets.dart`

**Tujuan Fungsional:**
Layar ikhtisar harian yang disajikan secara berbeda bergantung pada _Role_ user (Admin vs Manager vs Staff). Layar ini harus menyajikan informasi secara sekilas dan padat, menggunakan komponen _StatCard_ / Kartu Statistik.

**Komponen UI Prioritas Redesign:**

- **App Bar (Sapaan):** Menampilkan nama user dan rolenya secara vertikal (misal: "Halo, Bagas Fajaryanto\nManager"), berikut tombol "Lonceng Notifikasi" di sudut kanan atas.
- **Card Grid (Kartu Statistik Dinamis):**
  - **Super Admin:** Total User, Active User (7 hari), Total Submission.
  - **Manager (Approver):** Status "Urgent" (banyaknya pengajuan bersifat segera). _Catatan: Tab menunggu persetujuan sudah dialokasikan penuh di Bottom Nav, sehingga fitur ini sudah tidak boleh memakan porsi utama Dashboard lagi._
  - **Staff:** Menampilkan data "My Submissions" harian, mencakup Total Pengajuan Pribadi, "Disetujui", "Menunggu (Pending)", maupun "Ditolak".
- **Visualisasi/Warna:** Hindari warna dasar bawaan yang monoton. Gunakan gradien tipis (_subtle gradients_) pada _StatCard_, _shadow_ lembut, serta ikon-_ikon_ representatif.

---

## 3. Area Manajemen Pengajuan (Submission Area)

**Path Konten Utama:** `lib/features/submissions/views/submissions_screen.dart`

**Tujuan Fungsional:**
Menampilkan riwayat dan daftar semua Pengajuan/Request yang pernah dibuat oleh user. Dilengkapi fungsi filter dan sortir cerdas. Layar ini memiliki tombol aksi CTA melayang (_Floating Action Button_) untuk menuju "Buat Pengajuan Baru".

**Komponen UI Prioritas Redesign:**

- **Header Section (Search & Filter):** Harus tampak profesional dan tidak menghabiskan separuh layar. Integrasikan filter waktu, jenis, maupun status dengan gaya _Chips_ yang dapat discroll ke samping secara horizontal.
- **Submission List Item (Card):**
  - Harus menampilkan: Judul Pengajuan (_misal: Pembelian Alat Kantor_), Nama Pemohon, Divisi, Grand Total (_di-format sebagai nilai Mata Uang_), serta Status Akhir.
  - Harus ada indikator (label) status yang jelas secara visual: Menunggu (_Kuning/Oranye_), Disetujui (_Hijau_), Cancel/Ditolak (_Merah_).
- **Empty State:** Buat ilustrasi dan teks penjelas apabila tidak ada data dengan estetik. (Bukan sekadar teks di tengah _layar putih_).

---

## 4. Area Detail Pengajuan (Detail Submission Area)

**Path Konten Utama:** `lib/features/submissions/views/submission_detail_screen.dart`

**Tujuan Fungsional:**
Melihat rincian satu pengajuan, mencakup rincian item logistik, total harga, dokumen pendukung, dan catatan pelengkap.

**Komponen UI Prioritas Redesign:**

- **Detail Header:** Menyajikan Judul Laporan tegas, lengkap dengan Nama User Pembuat & Nama Divisi (_bukan dalam bentuk ID Database_), serta Grand Total Rupiah yang di-highlight mencolok.
- **Struktur Rincian (List Itemized):** Render setiap rincian biaya ke dalam formasi "faktur (_invoice-style_)" yang modern dan mudah dipahami. (List biaya Umum berbeda dengan form terkait Gaji).
- **Steppers/Jalur Persetujuan:** Tambahkan blok visualisasi "_Timeline/Steppers_" yang menggambarkan jalannya status aproval ("Manager A -> Disetujui", "Finance -> Pending"). (Jika variabelnya kosong, cukup tampilkan keterangan "Belum melewati proses validasi").

---

## 5. Area Pembuatan Pengajuan (Create Submission Area)

**Path Konten Utama:** `lib/features/submissions/views/submission_form_screen.dart`

**Tujuan Fungsional:**
Pengguna membuat pengajuan biaya dengan melampirkan keterangan yang dinamis menyesuaikan kategori jenis pengajuannya.

**Komponen UI Prioritas Redesign:**

- **Dynamic Input Form:** Saat Tipe Pengajuan (_Dropdown_) diubah pengguna (misal dari Umum ke Operasional Exim), bagian _fields_ rincian biaya harus merespon dengan transisi mulus/animasi tanpa _flicker_ drastis.
- **Fields Utama Harus Mencolok:** Field seperti "Judul Pengajuan", "Jenis Pengajuan", dan tampilan _Read-Only_ "Informasi Divisi Pembuat" harus dibedakan dari sisi tata letak (_padding_) agar lebih estetik.
- **Validasi Intuitif:** Pesan error _validation_ di bawah field ditampilkan dengan animasi sentuhan warna _error soft red_.

---

## 6. Area Persetujuan (Approval Area)

**Path Konten Utama:** `lib/features/approvals/views/approvals_screen.dart`, `lib/features/approvals/views/widgets/approval_card.dart`, `approval_action_dialog.dart`

**Tujuan Fungsional:**
Diperuntukkan khusus bagi user berwenang (_Approver_). Mengelola antrean keputusan pengajuan, apakah Disetujui atau Ditolak.

**Komponen UI Prioritas Redesign:**

- **Tabbed Interface:** Memiliki dua layar _Tab_ utama: **Menunggu** (antrean yang harus segera dieksekusi) dan **Riwayat** (daftar aksi keputusan yang sudah lampau oleh user tersebut).
- **Approval Card:**
  - Header yang mengandung Teks Judul panjang yang tidak boleh nabrak (_no text overflow, maxLines: 2, ellipsis_) serta lencana (_badge_) status berwarna tajam.
  - Ringkasan "Pemohon" di bagian kiri dan "Grand Total (Rp)" yang menonjol di sebelah kanan. Layout dirancang menggunakan Flexibel/Expanded agar selalu ideal di berbagai ukuran layar HP.
- **Action Dialog:**
  - Ketukan (_tap_) pada item akan memunculkan _Dialog/BottomSheet_.
  - Dialog ini menampilkan ringkasan data, dan memuat field teks input `Catatan` (Alasan menyetujui/menolak).
  - Berperan penting memegang tombol _Submit_: `Setujui` (Warna Hijau menyala) dan `Tolak` (Warna Merah menyala).

---

## 7. Area Profil (Profile Area)

**Path Konten Utama:** `lib/features/profile/views/profile_screen.dart`, `lib/features/profile/views/change_password_screen.dart`

**Tujuan Fungsional:**
Menampilkan informasi personal pegawai, akses pengaturan (Ubah Password), serta logout.

**Komponen UI Prioritas Redesign:**

- **Header Profil:** Avatar (_Profile Picture_) yang besar dengan Nama Terang. Menyartakan sub-deskripsi "Nama Divisi (Misalnya Divisi IT/Keuangan)" di bawahnya (_bukan ID integer_).
- **Digital Signature View:** Menampilkan secara elegan blok gambar **"Tanda Tangan Digital"** milik user tersebut. Apabila belum di-_setup_ di sistem _web_, berikan _container_ _placeholder_-nya berikut teks penjelas interaktif "Tanda tangan belum dikonfigurasi pada versi Web".
- **Menu List & Actions:** Tampilan _ListTiles_ untuk tombol "Ubah Password" (navigasi mandiri form input 3 textfield: Pass Lama, Pass Baru, Konfirmasi), dan tombol raksasa / paling bawah **"Keluar (Logout)"** dengan ikon tegas.

---

**Catatan Akhir Bagi Tim AI/UI/UX:**

- Seluruh aplikasi wajib mempertahankan konsistensi tata bahasa **Bahasa Indonesia** dalam navigasi dan _error message_.
- Menjaga filosofi _Error Handling yang Mudah Dipahami User_ (Jangan melempar raw _exception_, tampilkan _snackbar/bottom sheet custom error_ yang lucu/bersih).
- Pendekatan desain: _Clean UI, White Space yang cukup, Subtle Colors (Warna-warna lembut namun kredibel untuk perbankan/korporasi seperti Biru Metalik, Grey, Soft Orange, Soft Green)_.
