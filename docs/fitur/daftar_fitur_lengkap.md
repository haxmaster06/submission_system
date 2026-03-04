# Daftar Fitur Lengkap — HBM Budgeting System

> Dokumen ini mencatat **seluruh fitur** yang tersedia pada sistem HBM Budgeting, mencakup Backend (Laravel), Frontend Web (Next.js), dan Mobile (Flutter).
>
> **Terakhir diperbarui**: 4 Maret 2026

---

## 🔐 A. Autentikasi & Keamanan

| #   | Fitur            | Platform    | Keterangan                                                                                 |
| --- | ---------------- | ----------- | ------------------------------------------------------------------------------------------ |
| 1   | Login            | Web, Mobile | Login via email & password (Laravel Sanctum Token-Based)                                   |
| 2   | Logout           | Web, Mobile | Invalidasi token API                                                                       |
| 3   | Ubah Password    | Web, Mobile | Ganti password dari halaman Profil                                                         |
| 4   | Maintenance Mode | Web, Mobile | Super Admin mengaktifkan/menonaktifkan mode maintenance (blokade akses seluruh user biasa) |

---

## 📊 B. Dashboard

| #   | Fitur               | Platform    | Keterangan                                                                                                               |
| --- | ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 5   | Dashboard Staff     | Web, Mobile | Ringkasan pengajuan pribadi (total, disetujui, ditolak, pending)                                                         |
| 6   | Dashboard Eksekutif | Web, Mobile | Grafik tren anggaran, analisis kategori (Pie Chart), ranking pengeluaran antar divisi — untuk Manager, Director, Finance |
| 7   | Dashboard Admin     | Web         | Statistik global sistem, rekapitulasi — untuk Super Admin                                                                |

---

## 📝 C. Modul Pengajuan (Submissions)

| #   | Fitur                           | Platform    | Keterangan                                                                               |
| --- | ------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| 8   | Buat Pengajuan Reguler          | Web, Mobile | Isi metadata (divisi, jenis, urgensi) + item detail (nama, qty, satuan, harga)           |
| 9   | Buat Pengajuan Gaji             | Web         | Khusus HRD — upload daftar gaji via Excel atau input manual                              |
| 10  | Simpan sebagai Draf             | Web, Mobile | Pengajuan disimpan privat, belum masuk alur persetujuan                                  |
| 11  | Edit Draf                       | Web, Mobile | Ubah data pengajuan yang masih berstatus draf                                            |
| 12  | Hapus Draf (Owner)              | Web, Mobile | Pemilik dapat menghapus draf sendiri                                                     |
| 13  | Hapus Draf Massal (Bulk Delete) | Web         | Pilih banyak draf sekaligus untuk dihapus dari list                                      |
| 14  | Terbitkan Draf (Publish)        | Web, Mobile | Transisi draf → pending, generate nomor pengajuan resmi, mulai alur persetujuan          |
| 15  | Upload Lampiran                 | Web, Mobile | Unggah banyak file bukti (PDF/Gambar) per pengajuan                                      |
| 16  | Permintaan Lampiran             | Web         | Approver meminta lampiran tambahan dari pembuat pengajuan                                |
| 17  | Cetak / Ekspor PDF              | Web         | Generate formulir PDF standar perusahaan (A4) dengan item, total, tanda tangan, barcode  |
| 18  | Preview & Print URL             | Web         | URL preview dan print terproteksi signed URL                                             |
| 19  | Tandai Selesai (Complete)       | Web         | Menandai pengajuan sebagai selesai setelah dana cair                                     |
| 20  | Filter & Pencarian              | Web, Mobile | Filter berdasarkan status (Draf, Pending, Approved, Rejected, Completed), pencarian teks |
| 21  | Hapus Pengajuan Terbit          | Web         | Hanya user dengan permission `delete submissions` yang dapat menghapus pengajuan terbit  |

---

## ✅ D. Modul Persetujuan (Approvals)

| #   | Fitur                            | Platform    | Keterangan                                                                                                           |
| --- | -------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| 22  | Multi-Level Approval             | Web, Mobile | Persetujuan berurutan (Step 1 → Step 2 → dst). Approver berikutnya baru dinotifikasi setelah step sebelumnya selesai |
| 23  | Approve Pengajuan                | Web, Mobile | Setujui pengajuan dengan tanda tangan digital                                                                        |
| 24  | Reject Pengajuan                 | Web, Mobile | Tolak pengajuan (wajib isi alasan penolakan)                                                                         |
| 25  | Riwayat Persetujuan              | Web, Mobile | Lihat log history approval yang sudah dilakukan                                                                      |
| 26  | Proxy Director Signature         | Web         | Finance dapat menyetujui atas nama Direktur (dengan bukti kuasa)                                                     |
| 27  | Cek Status Tanda Tangan Direktur | Web         | Endpoint khusus untuk cek apakah Direktur sudah punya tanda tangan                                                   |

---

## ✍️ E. Tanda Tangan Digital (Signatures)

| #   | Fitur               | Platform    | Keterangan                                               |
| --- | ------------------- | ----------- | -------------------------------------------------------- |
| 28  | Upload Tanda Tangan | Web, Mobile | Unggah gambar tanda tangan (PNG transparan)              |
| 29  | Gambar Tanda Tangan | Web, Mobile | Canvas interaktif untuk menggambar tanda tangan langsung |
| 30  | Preview Stempel     | Web         | Pratinjau tampilan stempel persetujuan                   |
| 31  | Hapus Tanda Tangan  | Web, Mobile | Hapus tanda tangan yang sudah disimpan                   |

---

## 💰 F. Modul Realisasi (Realizations)

| #   | Fitur                | Platform | Keterangan                                                              |
| --- | -------------------- | -------- | ----------------------------------------------------------------------- |
| 32  | Buat Realisasi       | Web      | Upload laporan realisasi (pengeluaran aktual) setelah dana cair         |
| 33  | Monitoring Realisasi | Web      | Perbandingan nilai pengajuan vs nilai realisasi untuk audit sisa budget |

---

## 📈 G. Pelaporan (Reporting)

| #   | Fitur              | Platform | Keterangan                                                      |
| --- | ------------------ | -------- | --------------------------------------------------------------- |
| 34  | Laporan Pengajuan  | Web      | Laporan komprehensif pengajuan (filter periode, divisi, status) |
| 35  | Ekspor Laporan PDF | Web      | Export laporan ke format PDF                                    |
| 36  | Print Laporan      | Web      | Print langsung via browser (signed URL)                         |

---

## 🔔 H. Notifikasi

| #   | Fitur                        | Platform    | Keterangan                                                     |
| --- | ---------------------------- | ----------- | -------------------------------------------------------------- |
| 37  | Notifikasi In-App (Realtime) | Web, Mobile | WebSocket via Laravel Reverb & Echo — toast tanpa refresh      |
| 38  | Push Notification (FCM)      | Web, Mobile | Firebase Cloud Messaging — notifikasi OS meski tab/app ditutup |
| 39  | Kelola Notifikasi            | Web, Mobile | Tandai dibaca, tandai semua dibaca, hapus satuan, hapus massal |
| 40  | Registrasi Token FCM         | Web, Mobile | Simpan dan kelola token device untuk push notification         |

---

## 👥 I. Manajemen User (Super Admin)

| #   | Fitur                  | Platform | Keterangan                                                    |
| --- | ---------------------- | -------- | ------------------------------------------------------------- |
| 41  | CRUD User              | Web      | Tambah, edit, hapus pengguna                                  |
| 42  | Multi-Role Assignment  | Web      | Satu user dapat memiliki lebih dari satu peran (role)         |
| 43  | Daftar User Selectable | Web      | Endpoint khusus untuk dropdown pemilihan user (approver, dll) |

---

## 🛡️ J. Manajemen Peran & Hak Akses (Super Admin)

| #   | Fitur                      | Platform | Keterangan                                                                   |
| --- | -------------------------- | -------- | ---------------------------------------------------------------------------- |
| 44  | Matriks Peran & Permission | Web      | Tampilan matriks visual role vs permissions                                  |
| 45  | Edit Permission per Role   | Web      | Sync permissions untuk sebuah role                                           |
| 46  | Tambah Role Baru (CRUD)    | Web      | Super Admin membuat peran kustom baru                                        |
| 47  | Hapus Role Kustom          | Web      | Hapus role yang bukan bawaan sistem (dengan safety check)                    |
| 48  | Role Bawaan Terproteksi    | Backend  | Super Admin, Staff, HRD, GA Legal, Finance, GM, Director tidak dapat dihapus |

---

## ⚙️ K. Master Data (Admin)

| #   | Fitur                 | Platform | Keterangan                                               |
| --- | --------------------- | -------- | -------------------------------------------------------- |
| 49  | CRUD Divisi           | Web      | Kelola daftar divisi perusahaan                          |
| 50  | CRUD Jenis Pengajuan  | Web      | Kelola tipe pengajuan (Cash Advance, Reimbursement, dll) |
| 51  | CRUD Satuan (UOM)     | Web      | Kelola satuan ukuran (Pcs, Kg, Lot, dll)                 |
| 52  | CRUD Jenis Perjalanan | Web      | Kelola tipe perjalanan dinas                             |
| 53  | CRUD Status Urgensi   | Web      | Kelola level urgensi (Normal, Urgent) + drag/reorder     |

---

## 🔀 L. Alur Persetujuan (Approval Flow Engine)

| #   | Fitur                            | Platform | Keterangan                                                                    |
| --- | -------------------------------- | -------- | ----------------------------------------------------------------------------- |
| 54  | Konfigurasi Alur GUI             | Web      | Atur step-step approval secara visual                                         |
| 55  | Tambah/Edit/Hapus Step           | Web      | Kelola step approver dalam sebuah flow                                        |
| 56  | Reorder Steps                    | Web      | Drag & drop urutan step approval                                              |
| 57  | Konfigurasi Kondisi (Conditions) | Web      | Atur aturan routing (contoh: jika nominal > 5 Juta → butuh approval Direktur) |
| 58  | Toggle Kondisi Aktif/Non-aktif   | Web      | Aktifkan/nonaktifkan rule tanpa menghapus                                     |

---

## 👨‍💼 M. Data Karyawan

| #   | Fitur         | Platform | Keterangan                                                     |
| --- | ------------- | -------- | -------------------------------------------------------------- |
| 59  | CRUD Karyawan | Web      | Kelola data karyawan (digunakan untuk pengajuan gaji oleh HRD) |

---

## 📋 N. Audit & Logging

| #   | Fitur                 | Platform | Keterangan                                                                                           |
| --- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| 60  | Audit Trail Global    | Web      | Super Admin melihat seluruh riwayat perubahan data (Action, Model, User, Timestamp, Old/New payload) |
| 61  | Audit Log per Entitas | Web      | Lihat riwayat perubahan spesifik untuk satu objek                                                    |

---

## 📱 O. Mobile & Responsiveness

| #   | Fitur             | Platform    | Keterangan                                                     |
| --- | ----------------- | ----------- | -------------------------------------------------------------- |
| 62  | Splash Screen     | Mobile      | Layar pembuka dengan branding                                  |
| 63  | Responsive Layout | Web, Mobile | Table-to-Card transformation, glassmorphism, landscape support |

---

## 📖 P. Bantuan & Panduan

| #   | Fitur                     | Platform | Keterangan                                                         |
| --- | ------------------------- | -------- | ------------------------------------------------------------------ |
| 64  | Panduan Pengguna (In-App) | Web      | Manual book interaktif dengan pencarian, navigasi tab, dan animasi |

---

> **Total: 64 fitur** tersebar di 3 platform (Backend Laravel, Web Next.js, Mobile Flutter).
