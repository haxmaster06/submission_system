# Fitur-Fitur Aplikasi Mobile

## 1. Autentikasi & Profil

- **Login**: Autentikasi menggunakan email dan password. Terintegrasi dengan Laravel Sanctum.
- **Profil User**: Menampilkan informasi nama, peran (role), dan divisi.
- **Tanda Tangan Digital**: Menyimpan dan mengelola path tanda tangan user untuk proses persetujuan.

## 2. Dashboard

- **Statistik Ringkasan**: Menampilkan jumlah pengajuan berdasarkan status (Pending, Approved, Rejected).
- **Akses Cepat**: Pintasan untuk membuat pengajuan baru.

## 3. Manajemen Pengajuan (Submissions)

Aplikasi mendukung dua tipe pengajuan utama:

### A. Pengajuan Standar (Biaya Operasional, Perjalanan Dinas, dll)

- **Multi-Items**: Bisa menambah banyak baris item dalam satu pengajuan.
- **Detil Kuantitas**: Mendukung input QTY dan Satuan (UOM).
- **Urgency Level**: Pilihan status Normal atau Urgent.

### B. Matrix Gaji (Karyawan Harian)

- **Pemilihan Periode**: Rentang tanggal (Start & End Date).
- **Seleksi Hari Aktif**: Toggle hari kerja untuk mengeksklusi hari libur atau non-aktif.
- **Grid Matrix**: Input nominal harian per karyawan secara langsung dalam tabel.
- **Smart Auto-Fill**: Mengisi otomatis nominal berdasarkan formula `Gaji Pokok / 25`.
- **Kalkulasi Otomatis**: Subtotal per karyawan dan Grand Total pengajuan dihitung secara real-time.

### C. Kelengkapan Pengajuan

- **Lampiran (Attachments)**: Upload bukti dukung (foto nota/dokumen) langsung dari kamera atau galeri.
- **Penyelesaian (Completion)**: Mengunci draft pengajuan dan memulai alur persetujuan (Approval Flow).

## 4. Sistem Persetujuan (Approvals)

- **Daftar Tugas (Inbox)**: Menampilkan pengajuan yang memerlukan persetujuan user.
- **Riwayat Approval**: Melihat daftar pengajuan yang telah diproses.
- **Aksi Persetujuan**: Approve atau Reject dengan catatan (notes) tambahan.

## 5. Sinkronisasi Data Master

- **Lookups**: Sinkronisasi dinamis untuk data Divisi, Jenis Pengajuan, UOM, dan Status Urgensi.
- **Data Karyawan**: Mengambil data karyawan aktif untuk kebutuhan Matrix Gaji.
