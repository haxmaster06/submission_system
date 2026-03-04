# Changelog — HBM Budgeting System

Riwayat penambahan fitur dan perubahan signifikan pada sistem.

---

## [2026-03-04] — Draf, Penghapusan, & Manajemen Role

### Ditambahkan

- **Status Draf**: Pengguna dapat menyimpan pengajuan sebagai draf sebelum diterbitkan. Draf bersifat privat dan tidak terlihat oleh approver.
- **Edit Draf**: Draf dapat diubah kapan saja sebelum diterbitkan.
- **Hapus Draf**: Pemilik dapat menghapus draf sendiri (single & bulk delete).
- **Terbitkan Draf**: Draf dapat diterbitkan untuk memulai alur persetujuan dan menghasilkan nomor pengajuan resmi.
- **Warning Publish**: Dialog konfirmasi detail sebelum menerbitkan draf (konsekuensi: read-only, alur approval dimulai).
- **CRUD Role**: Super Admin dapat membuat dan menghapus peran kustom melalui UI.
- **Multi-Role per User**: Pengguna dapat memiliki lebih dari satu peran secara bersamaan.
- **UI Multi-Role**: Form user management diperbarui dari dropdown ke grid multi-select.

### Diubah

- **SubmissionPolicy**: Logika penghapusan diperhalus — owner hanya bisa hapus draf, pengajuan terbit memerlukan permission `delete submissions`.
- **UserController**: `store` dan `update` kini menerima `roles` (array) alih-alih `role` (string tunggal).
- **RolePermissionController**: Ditambahkan method `store` dan `destroy` untuk manajemen Role CRUD.
- **Bulk Delete**: Kini menggunakan policy-based authorization per item, memungkinkan owner menghapus draf mereka sendiri.

### Dokumentasi

- Seluruh dokumentasi dikonsolidasikan ke folder `docs/` dengan struktur terorganisir.
- Ditambahkan katalog fitur lengkap (64 fitur).
- Diperbarui panduan pengguna, arsitektur sistem, dan README.

---

## [2026-03-03] — Implementasi Awal Status Draf

### Ditambahkan

- Kolom `final_status` default `draf` pada tabel `submissions`.
- Endpoint `POST /submissions/{id}/publish` untuk mengirim draf.
- Endpoint `PUT /submissions/{id}` untuk mengedit draf.
- Tombol "Simpan Draf" di form pengajuan (Web & Mobile).
- Tab "Draf" pada daftar pengajuan (Web & Mobile).
- Notifikasi realtime hanya dikirim saat pengajuan diterbitkan, bukan saat disimpan sebagai draf.

---

## [2026-02-xx] — Fitur Inti (Sebelumnya)

### Fitur Dasar

- Manajemen pengajuan (CRUD), approval workflow bertingkat, tanda tangan digital.
- Real-time notification (Laravel Reverb + FCM).
- Dashboard role-based (Staff, Eksekutif, Admin).
- Master Data management, Approval Flow Engine GUI.
- Realisasi & Reporting, Audit Trail.
- Maintenance Mode.
- Mobile app (Flutter) dengan fitur parity.
