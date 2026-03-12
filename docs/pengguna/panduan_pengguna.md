# Panduan Pengguna - HBM Budgeting System

Selamat datang di Sistem Budgeting HBM. Panduan ini menjelaskan cara menggunakan fitur-fitur utama aplikasi.

## Daftar Isi

1. [Login & Dashboard](#1-login--dashboard)
2. [Membuat Pengajuan Anggaran](#2-membuat-pengajuan-anggaran)
3. [Proses Persetujuan (Approval)](#3-proses-persetujuan-approval)
4. [Melihat Status & Riwayat](#4-melihat-status--riwayat)
5. [Tanda Tangan Digital](#5-tanda-tangan-digital)
6. [Fitur Proxy (Untuk Direktur)](#6-fitur-proxy-untuk-direktur)

---

## 1. Login & Dashboard

- Akses aplikasi melalui browser atau Aplikasi Mobile.
- Masukkan **Email** dan **Password** yang telah diberikan oleh IT.
- Setelah login, Anda akan melihat **Dashboard** yang menyesuaikan dengan peran Anda:
  - **Staff**: Ringkasan pengajuan pribadi (Total, Disetujui, Ditolak).
  - **Management**: Grafik tren anggaran, analisis kategori pengajuan, dan ranking penggunaan budget tiap divisi.
  - **Super Admin**: Statistik global sistem dan log aktivitas terbaru.
- **Visualisasi Data**: Gunakan grafik untuk memantau sisa budget dan tren realisasi dana secara realtime.

## 2. Membuat Pengajuan Anggaran

1. Navigasi ke menu **Pengajuan -> Buat Baru**.
2. Pilih **Divisi** dan **Jenis Pengajuan**.
3. Isi detail item barang/jasa yang dibutuhkan (Nama, Qty, Harga Satuan).
4. **Metode Penyimpanan**:
   - **Simpan Draf**: Gunakan jika Anda belum selesai mengisi data. Pengajuan tidak akan dikirim ke approver dan Anda bisa mengubahnya nanti.
   - **Kirim/Ajukan**: Gunakan jika data sudah final. Sistem akan mulai menjalankan alur persetujuan.
5. **Penting**: Sistem akan otomatis mengecek sisa budget divisi Anda.
   > **Peringatan**: Jika total pengajuan melebihi sisa budget bulanan, notifikasi peringatan akan dikirim ke HRD.
6. Upload lampiran pendukung (PDF/Gambar) jika ada.
7. **Penghapusan**: Anda dapat menghapus pengajuan yang masih berstatus **Draf**. Pengajuan yang sudah diterbitkan (Terbit) hanya dapat dihapus oleh Admin/Super Admin.

## 3. Proses Persetujuan (Approval)

Jika Anda adalah approver (Manager/Director):

1. Anda akan menerima notifikasi (Lonceng di pojok kanan atas) saat ada pengajuan masuk.
2. Buka menu **Persetujuan (Approvals)**.
3. Klik tombol **Review** pada item yang berstatus _Pending_ atau _Direvisi_.
4. Periksa detail pengajuan. Tersedia tiga opsi aksi:
   - **Approve**: Untuk menyetujui pengajuan (wajib Tanda Tangan Digital).
   - **Tunda (Hold)**: Untuk mengembalikan pengajuan ke pembuat agar diperbaiki/direvisi (wajib isi catatan). Pembuat akan mendapat notifikasi untuk memperbaiki draf dan mengajukan ulang.
   - **Reject**: Untuk menolak pengajuan secara permanen (wajib isi alasan).

## 4. Melihat Status & Riwayat

- Buka menu **Pengajuan -> Daftar Pengajuan**.
- Gunakan filter status untuk melihat pengajuan yang _Approved_, _Rejected_, _Pending_, atau _Ditunda_.
- Fitur **Paginasi** tersedia di bagian bawah layar untuk menavigasi halaman jika data terlalu banyak.
- Klik ikon mata (View) untuk melihat detail progress approval, termasuk revisi jika sebelumnya ditunda.
- Anda dapat mengunduh dokumen pengajuan dalam format **PDF** melalui tombol di halaman detail.

## 5. Tanda Tangan Digital

- Masuk ke **Profile** (Klik nama Anda di pojok kanan atas).
- Pada bagian **Tanda Tangan**, Anda bisa:
  a. **Upload**: Unggah gambar tanda tangan (PNG transparan disarankan).
  b. **Gambar**: Menggambar langsung di layar (Canvas).
- Tanda tangan ini akan digunakan otomatis saat Anda melakukan approval.

## 6. Fitur Proxy (Untuk Direktur)

Khusus Direktur yang sedang berhalangan:

1. Manager/Admin dapat melakukan approval 'atas nama' Direktur jika diberi wewenang.
2. Saat approval, pilih opsi **"Tanda Tangan sebagai Proxy"**.
3. Sistem akan meminta upload **Bukti Kuasa** (Surat/Chat persetujuan).
4. **Info**: Direktur akan menerima notifikasi _realtime_ setiap kali fitur ini digunakan untuk keamanan.

## 7. Download & Kelola Aplikasi Mobile

- **Untuk Pengguna**: Jika ada versi terbaru Aplikasi Mobile HBM, sebuah _banner_ akan muncul di bagian atas halaman Dashboard Web. Klik "Download APK" untuk mengunduh aplikasinya.
- **Untuk Super Admin**: Kunjungi menu **Mobile Apps** di bawah panel administrasi. Anda bisa melihat daftar rilis, mengunggah versi APK/IPA terbaru lengkap dengan _progress bar_ saat proses unggah, dan mengaktifkan rilis tersebut agar muncul di Dashboard para pengguna.
