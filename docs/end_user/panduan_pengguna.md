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

- Akses aplikasi melalui browser (Chrome/Edge disarankan).
- Masukkan **Email** dan **Password** yang telah diberikan oleh IT.
- Setelah login, Anda akan melihat **Dashboard** yang menampilkan ringkasan pengajuan Anda (Total Pengajuan, Disetujui, Ditolak, Pending).

## 2. Membuat Pengajuan Anggaran

1. Navigasi ke menu **Pengajuan -> Buat Baru**.
2. Pilih **Divisi** dan **Jenis Pengajuan**.
3. Isi detail item barang/jasa yang dibutuhkan (Nama, Qty, Harga Satuan).
4. **Penting**: Sistem akan otomatis mengecek sisa budget divisi Anda.
   > **Peringatan**: Jika total pengajuan melebihi sisa budget bulanan, notifikasi peringatan akan dikirim ke HRD.
5. Upload lampiran pendukung (PDF/Gambar) jika ada.
6. Klik **Simpan** untuk mengirim pengajuan.

## 3. Proses Persetujuan (Approval)

Jika Anda adalah approver (Manager/Director):

1. Anda akan menerima notifikasi (Lonceng di pojok kanan atas) saat ada pengajuan masuk.
2. Buka menu **Persetujuan (Approvals)**.
3. Klik tombol **Review** pada item yang berstatus _Pending_.
4. Periksa detail pengajuan.
5. Klik **Approve** untuk menyetujui, atau **Reject** untuk menolak (Wajib isi alasan).
6. Masukkan Tanda Tangan Digital Anda untuk konfirmasi.

## 4. Melihat Status & Riwayat

- Buka menu **Pengajuan -> Daftar Pengajuan**.
- Gunakan filter status untuk melihat pengajuan yang _Approved_, _Rejected_, atau _Pending_.
- Klik ikon mata (View) untuk melihat detail progress approval.
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
