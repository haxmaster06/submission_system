# Feature: Request Attachment (Kolaborasi Lampiran)

## Deskripsi

Fitur ini memungkinkan pemilik pengajuan (Submitter) untuk meminta bantuan user spesifik lain untuk mengunggah berkas lampiran (attachment) ke dalam pengajuan yang sedang diproses. Ini memecahkan masalah ketika bukti atau dokumen pendukung dimiliki oleh orang lain atau divisi lain.

## Alur Bisnis (Business Flow)

1. **Requesting**: Saat membuat atau mengedit pengajuan, Submitter memilih opsi "Minta Lampiran".
2. **Targeting**: Submitter memilih **User Spesifik** dan memberikan deskripsi berkas yang diminta (contoh: "Tolong upload Invoice Hotel").
3. **Notification**: Sistem mengirimkan notifikasi internal dan Push Notification (FCM) ke Target User.
4. **Fulfilling**: Target User mengklik notifikasi, diarahkan ke halaman pengajuan terkait, dan melakukan unggah berkas. Target User hanya memiliki akses "Upload" (tidak bisa edit data lain).
5. **Completion**: Setelah file diunggah, Submitter menerima notifikasi bahwa berkas sudah tersedia.

## Komponen Teknis

- **Model**: `AttachmentRequest` (Tracks request status: pending, fulfilled, cancelled).
- **Security**: Policy khusus untuk mengizinkan non-owner mengunggah file jika terdapat `AttachmentRequest` yang valid.
- **UI/UX**:
  - Dashboard widget untuk Target User ("Tugas Unggah Berkas").
  - Section "Requested Files" di detail pengajuan.

## Status Fitur

- **Status**: Implemented (Web & Mobile)
- **Target**: Web & Mobile App
