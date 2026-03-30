# Panduan Pengguna — HBM Budgeting System

Selamat datang di Sistem Budgeting HBM. Panduan ini menjelaskan cara menggunakan seluruh fitur aplikasi, baik via Web maupun Mobile.

---

## Daftar Isi

1. [Login & Dashboard](#1-login--dashboard)
2. [Membuat Pengajuan Anggaran](#2-membuat-pengajuan-anggaran)
3. [Pengajuan Gaji (Salary)](#3-pengajuan-gaji-salary)
4. [Draf & Penerbitan](#4-draf--penerbitan)
5. [Duplikat Pengajuan](#5-duplikat-pengajuan)
6. [Filter & Pencarian Pengajuan](#6-filter--pencarian-pengajuan)
7. [Status Urgensi (Normal / Urgent)](#7-status-urgensi-normal--urgent)
8. [Proses Persetujuan (Approval)](#8-proses-persetujuan-approval)
9. [Monitoring Realisasi Anggaran](#9-monitoring-realisasi-anggaran)
10. [Laporan & Reporting](#10-laporan--reporting)
11. [Cetak & Ekspor PDF](#11-cetak--ekspor-pdf)
12. [Tanda Tangan Digital](#12-tanda-tangan-digital)
13. [Fitur Proxy (Untuk Direktur)](#13-fitur-proxy-untuk-direktur)
14. [Permintaan Lampiran (Attachment Request)](#14-permintaan-lampiran-attachment-request)
15. [Notifikasi & Aktivitas Real-Time](#15-notifikasi--aktivitas-real-time)
16. [Profil & Ubah Password](#16-profil--ubah-password)
17. [Download & Kelola Aplikasi Mobile](#17-download--kelola-aplikasi-mobile)
18. [Panduan Bantuan (In-App Manual)](#18-panduan-bantuan-in-app-manual)
19. [Panel Administrasi (Super Admin)](#19-panel-administrasi-super-admin)

---

## 1. Login & Dashboard

- Akses aplikasi melalui **browser** atau **Aplikasi Mobile**.
- Masukkan **Email** dan **Password** yang telah diberikan oleh IT.
- Setelah login, Anda akan melihat **Dashboard** yang menyesuaikan dengan peran Anda:
  - **Staff**: Ringkasan pengajuan pribadi (Total, Disetujui, Ditolak, Draf Saya).
  - **Management** (GM/Director/Finance): Grafik tren anggaran vs realisasi (6 bulan), analisis kategori pengajuan (Pie Chart), ranking pengeluaran divisi (Bar Chart), indikator urgensi, fokus strategis (5 pengajuan nilai tertinggi yang belum di-approve), dan feed aktivitas real-time.
  - **Super Admin**: Statistik global sistem (Total Pengguna, Total Pengajuan, Total Anggaran Disetujui, Total Realisasi), Top Divisi berdasarkan anggaran, dan Audit Log terbaru.
- **Perlu Perhatian Anda**: Section khusus yang menampilkan item approval dan permintaan lampiran yang menunggu tindakan Anda.

## 2. Membuat Pengajuan Anggaran

1. Navigasi ke menu **Pengajuan → Buat Pengajuan Baru**.
2. Isi informasi umum:
   - **Divisi** (otomatis terisi sesuai profil Anda).
   - **Status Urgensi** (Normal atau Urgent). Lihat [Bagian 7](#7-status-urgensi-normal--urgent) untuk detail.
3. Pilih **Jenis Pengajuan** dan **Jenis Perjalanan** (opsional).
4. Isi **Judul Pengajuan** dan **Catatan Tambahan** (opsional).
5. Tambahkan item anggaran (Deskripsi, Jumlah, Satuan, Harga Satuan). Anda dapat menambah beberapa item.
6. **Metode Penyimpanan**:
   - **Simpan Draf**: Pengajuan disimpan tanpa dikirim ke approver. Bisa diubah nanti.
   - **Buat Pengajuan (Kirim)**: Data final, langsung masuk alur persetujuan.
7. Upload lampiran pendukung (PDF/Gambar) jika ada.
8. **Penghapusan**: Draf bisa dihapus oleh pembuat. Pengajuan terbit hanya bisa dihapus oleh Admin/Super Admin.

> **Peringatan**: Jika total pengajuan melebihi sisa budget bulanan divisi, notifikasi peringatan akan dikirim ke HRD.

## 3. Pengajuan Gaji (Salary)

Khusus untuk HRD/bagian terkait:

1. Pilih menu **Pengajuan → Pengajuan Gaji**.
2. Anda dapat melampirkan daftar gaji karyawan lewat **file Excel** atau menginputnya secara manual per karyawan per hari.
3. Sistem otomatis menghitung subtotal per karyawan dan grand total.
4. Sama seperti pengajuan reguler, bisa disimpan sebagai draf atau langsung dikirim.

## 4. Draf & Penerbitan

- **Mengelola Draf**: Buka tab **"Draf"** di halaman Pengajuan Saya.
  - **Ubah Draf**: Mengedit data pengajuan yang belum diterbitkan.
  - **Terbitkan**: Menerbitkan draf agar masuk ke alur persetujuan. Setelah diterbitkan, data **tidak bisa diubah lagi**.
  - **Hapus Draf**: Menghapus draf yang tidak diperlukan.
- **Revisi (Hold)**: Jika pengajuan ditunda oleh approver, pengajuan masuk status **On Hold** dan muncul tombol **"Revisi Pengajuan"** untuk memperbaiki data lalu mengajukan ulang.
- **Selesaikan**: Pengajuan yang sudah disetujui dapat ditandai "Selesai" oleh role yang berwenang.

## 5. Duplikat Pengajuan

- Di halaman detail pengajuan, klik tombol **"Duplikat"** untuk membuat pengajuan baru dengan data yang sudah terisi dari pengajuan sebelumnya.
- Berguna untuk pengajuan rutin/berulang.

## 6. Filter & Pencarian Pengajuan

Tersedia di halaman **Pengajuan Saya**:

- **Pencarian**: Cari berdasarkan No. Pengajuan atau Deskripsi.
- **Tab Status**: Semua, Draf, Menunggu, Disetujui, Ditolak.
- **Filter Lanjutan** (klik tombol "Filter"):
  - **Divisi** (untuk role Super Admin/Director/GM/Finance)
  - **Jenis Pengajuan**
  - **Urgensi** (Semua / Normal / Urgent)
  - **Rentang Tanggal** (Dari – Sampai)
- **Reset Filter**: Menghapus semua filter aktif.
- **Paginasi**: Navigasi halaman jika data terlalu banyak.

> **Mobile**: Filter status dan urgensi tersedia sebagai pill tabs di bagian atas layar.

## 7. Status Urgensi (Normal / Urgent)

Setiap pengajuan memiliki status urgensi:

- **Normal**: Alur approval berjalan berurutan sesuai hierarki (Manager → HRD/GA → Finance → GM → Director).
- **Urgent (Mendesak)**:
  - Semua approver akan **menerima notifikasi secara bersamaan** saat pengajuan dibuat/diubah ke Urgent.
  - Setiap approver **boleh menyetujui tanpa menunggu giliran**.
  - **Auto-Approval Cascade (Khusus Direktur)**: Jika **Direktur** menyetujui terlebih dahulu, maka semua step di bawahnya (GM, Finance, HRD/GA, Manager) akan **otomatis disetujui** oleh sistem.
  - Approval oleh role selain Direktur pada pengajuan Urgent **tidak** memicu cascade otomatis.
  - Badge **"URGENT"** dan **"Auto-Approved"** akan ditampilkan di timeline persetujuan.

## 8. Proses Persetujuan (Approval)

Jika Anda adalah approver (Manager/HRD/Finance/GM/Director):

1. Anda akan menerima **notifikasi** (ikon lonceng di pojok kanan atas) saat ada pengajuan masuk.
2. Buka menu **Persetujuan (Approvals)**.
3. Klik **Review** pada item yang berstatus _Pending_ atau _Direvisi_.
4. Periksa detail pengajuan. Tersedia tiga opsi aksi:
   - **Approve (Setujui)**: Menyetujui pengajuan — wajib Tanda Tangan Digital.
   - **Tunda (Hold)**: Mengembalikan pengajuan ke pembuat agar diperbaiki — wajib isi catatan. Pembuat akan mendapat notifikasi untuk merevisi lalu mengajukan ulang.
   - **Reject (Tolak)**: Menolak pengajuan secara permanen — wajib isi alasan.
5. **Riwayat Log**: Setiap tindakan tercatat di tab "Riwayat Log" pada halaman detail pengajuan.

## 9. Monitoring Realisasi Anggaran

Tersedia di menu **Monitoring Realisasi** (untuk Finance/Super Admin dan role terkait):

- Menampilkan daftar pengajuan yang sudah disetujui beserta perbandingan **Budget vs Realisasi Aktual**.
- Status realisasi per pengajuan:
  - **Under Budget**: Dana terpakai lebih sedikit dari budget.
  - **Over Budget**: Dana terpakai melebihi budget.
  - **Sesuai Budget**: Dana terpakai sama persis dengan budget.
- Filter berdasarkan pencarian dan status realisasi (Semua / Under / Over / Sesuai).
- Klik kartu untuk melihat detail pengajuan dan memasukkan data realisasi.
- Tab **"Realisasi Anggaran"** juga tersedia di halaman detail setiap pengajuan.

## 10. Laporan & Reporting

Tersedia di menu **Laporan Realisasi & Budget**:

- Menampilkan laporan pengajuan yang dikelompokkan **per Divisi** dengan kolom:
  - No. Pengajuan, Status, Deskripsi, Budget Awal, Realisasi (Actual), dan Sisa/Selisih.
- **Kartu Ringkasan**: Total tiket, total pengajuan vs realisasi, dan selisih keseluruhan.
- **Filter Lanjutan**: Status, Divisi, Jenis Pengajuan, Rentang Tanggal.
- **Cetak Laporan**: Mencetak laporan langsung dari browser.
- **Ekspor ke PDF**: Mengunduh laporan dalam format PDF.

## 11. Cetak & Ekspor PDF

- Di halaman detail pengajuan (menu **Pengajuan Saya** → klik detail):
  - Tombol **Print**: Merangkum seluruh rincian barang, total biaya, dan barcode persetujuan ke dokumen A4.
  - Tombol **Export PDF**: Mengunduh dokumen pengajuan dalam format PDF.

## 12. Tanda Tangan Digital

- Masuk ke **Profil & Tanda Tangan** (klik nama Anda di pojok kiri atas).
- Pada bagian **Tanda Tangan**, Anda bisa:
  - **Upload**: Unggah gambar tanda tangan (PNG transparan disarankan).
  - **Gambar**: Menggambar langsung di layar (Canvas).
- Tanda tangan ini akan digunakan **otomatis** saat Anda melakukan approval.
- **Wajib bagi setiap Approver!**

## 13. Fitur Proxy (Untuk Direktur)

Khusus Direktur yang sedang berhalangan:

1. Manager/Admin dapat melakukan approval **atas nama** Direktur jika diberi wewenang.
2. Saat approval, pilih opsi **"Tanda Tangan sebagai Proxy"**.
3. Sistem akan meminta upload **Bukti Kuasa** (Surat/Chat persetujuan).
4. **Info**: Direktur akan menerima notifikasi _realtime_ setiap kali fitur ini digunakan untuk keamanan.
5. Di timeline approval, bukti kuasa proxy ditampilkan sebagai link **"Bukti TTD (Proxy)"**.

## 14. Permintaan Lampiran (Attachment Request)

- Approver dapat **meminta dokumen tambahan** kepada pembuat pengajuan sebelum menyetujui.
- Pembuat akan melihat **banner notifikasi** di halaman detail pengajuan apabila ada permintaan lampiran yang belum dipenuhi.
- Pembuat dapat langsung mengunggah berkas yang diminta dari halaman detail tersebut.

## 15. Notifikasi & Aktivitas Real-Time

- **Ikon Lonceng** di pojok kanan atas menampilkan notifikasi terbaru (approval masuk, approval ditolak, permintaan lampiran, dll.).
- **Dashboard Aktivitas Langsung**: Feed real-time yang menunjukkan siapa menyetujui/menolak/menunda pengajuan mana, dengan timestamp.
- **Mobile**: Notifikasi push tersedia melalui FCM (Firebase Cloud Messaging).

## 16. Profil & Ubah Password

- Buka menu **Profil & Tanda Tangan** di sidebar.
- **Ganti Password**: Masukkan password lama, lalu masukkan password baru.
- **Lihat Peran**: Peran (roles) Anda ditampilkan di bagian atas profil.
- **Tanda Tangan**: Upload atau gambar tanda tangan digital (lihat [Bagian 12](#12-tanda-tangan-digital)).

> **Penting**: Segera ganti password default saat pertama kali login.

## 17. Download & Kelola Aplikasi Mobile

- **Untuk Pengguna**: Jika ada versi terbaru Aplikasi Mobile HBM, sebuah _banner_ akan muncul di bagian atas halaman Dashboard Web. Klik **"Download APK"** untuk mengunduh.
- **Untuk Super Admin**: Kunjungi menu **Mobile Apps** di panel administrasi:
  - Lihat daftar rilis yang sudah diunggah.
  - Unggah versi APK/IPA terbaru dengan _progress bar_.
  - Aktifkan rilis agar muncul di Dashboard para pengguna.

## 18. Panduan Bantuan (In-App Manual)

- Tersedia di menu **Bantuan & Panduan** di sidebar.
- Berisi panduan interaktif dengan kategori:
  - **Persiapan Awal** (Ganti Password, Tanda Tangan, Roles, Budget Limit)
  - **Informasi Umum** (Navigasi, Paginasi, Unduh Aplikasi Mobile)
  - **Membuat Pengajuan** (Draf, Reguler, Gaji, Mengelola Draf)
  - **Alur Persetujuan** (Bagi Pembuat, Bagi Approver, Opsi Persetujuan)
  - **Cetak & Unduh PDF**
  - **Pengaturan & Tanda Tangan**
- Dilengkapi **fitur pencarian** untuk menemukan topik spesifik.

## 19. Panel Administrasi (Super Admin)

Khusus untuk peran **Super Admin**, tersedia menu administrasi:

### a. Master Data
Kelola data dasar sistem:
- **Divisi**: Nama, Kode, Budget Limit bulanan.
- **Jenis Pengajuan**: Kategori pengajuan (dengan flag Travel/Non-Travel).
- **Status Urgensi**: Daftar level urgensi (drag-and-drop untuk mengubah urutan).
- **Jenis Perjalanan**: Kategori perjalanan dinas.
- **Satuan (UOM)**: Unit of Measure untuk item anggaran.
- Mendukung **Bulk Create** (tambah beberapa data sekaligus).

### b. Alur Persetujuan (Approval Flow)
Konfigurasi alur persetujuan dinamis:
- **Alur Dasar**: Urutan role yang menyetujui pengajuan (drag-and-drop untuk mengubah urutan).
- **Aturan Kondisi**: Step tambahan yang disisipkan otomatis berdasarkan kondisi tertentu (misalnya: divisi HRD, jenis perjalanan Dinas, dll.).
- **Preview Alur**: Melihat hasil alur berdasarkan kombinasi kondisi yang aktif.

### c. Manajemen Pengguna
- Tambah, edit, dan hapus pengguna.
- Atur divisi, peran (roles), dan status aktif pengguna.

### d. Manajemen Roles
- Kelola peran (roles) dan hak akses di sistem.

### e. Audit Log
- Riwayat lengkap semua aktivitas sistem (siapa melakukan apa, kapan, pada objek apa).

### f. Data Karyawan
- Kelola database karyawan untuk keperluan pengajuan gaji.

### g. Mobile Apps
- Unggah dan kelola versi aplikasi mobile (lihat [Bagian 17](#17-download--kelola-aplikasi-mobile)).

### h. Maintenance Mode
- Aktifkan/nonaktifkan **Maintenance Mode** untuk menonaktifkan access publik sementara saat pemeliharaan sistem.

---

*Panduan ini terakhir diperbarui pada 28 Maret 2026.*
