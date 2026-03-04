# Prompt Generator UI HBM Submission System (Mobile App)

**Konteks Aplikasi:**
Aplikasi ini bernama "HBM Submission System". Ini adalah aplikasi mobile internal berbasis korporat/perusahaan (B2B/Enterprise) yang dikhususkan untuk memfasilitasi karyawan dalam membuat, melacak, dan meriview pengajuan (submission) anggaran, pengadaan barang, operasional, gaji, dan logistik.

**Target Audiens:**
Karyawan perusahaan (Staff) hingga Tingkat Manajemen (Manager, GM, Director) dan Super Admin. Desain harus memancarkan kesan profesional, bersih (clean), modern, dan _trustworthy_ ala aplikasi finansial atau korporat modern. Gunakan palet warna yang tenang dan kredibel (misalnya kombinasi Biru Navy/Metalik, Putih Bersih, Abu-abu lembut, dengan aksen warna fungsional seperti Hijau untuk "Disetujui", Merah/Oranye untuk "Ditolak/Menunggu").

**Tugas Anda (AI Designer):**
Buatkan desain UI/UX yang komprehensif, responsif, modern, dan sangat _user-friendly_ berdasarkan alur aplikasi saat ini. Jangan mengubah _business logic_ atau struktur fitur, tetapi tingkatkan _layout_, tipografi, _spacing_, dan interaksi mikro (animasi/transisi).

Silakan _generate_ ulang UI komponen-komponen berikut berdasarkan spesifikasi di bawah ini:

---

## 1. Global Navigation (Bottom Nav Bar)

- **Komponen:** Persistent Bottom Navigation Bar.
- **Isi Standar (3 Tab):** Dashboard (Beranda), Submissions (Pengajuan), Profile (Profil).
- **Kondisi Dinamis (4 Tab):** Jika _User_ yang login menjabat sebagai Manager/Director/Finance (memiliki hak "Approval"), selipkan tab ke-4 bernama "Approval" (Persetujuan) yang diletakkan di antara Submissions dan Profile.
- **Gaya:** Minimalis dengan ikon yang jelas (misal: _outlined_ saat tidak aktif, _filled_ + _tint color_ saat aktif).

## 2. Area Login

- **Elemen:** Logo Perusahaan di tengah-atas. Input field NIK/Email dan Password yang memiliki _floating label_ dan ikon visibilitas password. Checkbox "Ingat Saya" (Stay Login). Tombol masuk (Login) utama yang lebar, menampilkan indikator _loading_ saat ditekan.
- **Kenyamanan Input:** Form input harus responsif terhadap kemunculan _keyboard_ virtual (terscrool otomatis agar tidak tertutup).

## 3. Area Dashboard

- **Header:** Sapaan nama user ("Halo, [Nama]") dan Roles ("Staff" / "Manager"), di pojok kanan ada ikon Lonceng (Notifikasi).
- **Konten Utama:** Menggunakan model "StatCard" (Kartu Statistik Grid).
  - **Jika Super Admin:** Tampilkan metrik makro (Total User, Total Submission).
  - **Jika Manager:** Fokuskan Tampilan indikator "Pengajuan Urgent (Mendesak)".
  - **Jika Staff:** Kartu "Total Pengajuanku", "Disetujui", "Menunggu", "Ditolak".
- **Gaya StatCard:** Gunakan _shadow_ tipis, ikon yang relevan, dan angka besar yang menonjol. Berikan gradien halus pada _background card_ atau _accent bar_ di sisi kiri kartu.

## 4. Area Submissions (Daftar Pengajuan)

- **Header:** Judul Halaman dan bilah pencarian (Search Bar) serta _Chip Filters_ (Semua, Menunggu, Disetujui, Ditolak) yang bisa di-_scroll_ horizontal.
- **List Item (Card):** Setiap _card_ pengajuan memuat: Judul (_bold_, teks terpotong rapi/ellipsis bila kepanjangan), Nama Pemohon, Divisi, Grand Total (Format Rupiah, misal **Rp 25.000.000** menonjol di kanan/bawah), dan _Status Badge/Chip_ yang warnanya disesuaikan.
- **Aksi Khusus:** _Floating Action Button_ (FAB) di kanan bawah dengan ikon (+) untuk "Buat Pengajuan Baru".

## 5. Area Detail Submission

- **Header Detail:** Judul besar, Info Pembuat, Tanggal, dan Grand Total yang sangat di-highlight (mirip nota/invoice).
- **Rincian Biaya:** Tabel/Daftar modern per _item_ pengajuan.
- **Alur Persetujuan (Timeline/Stepper):** Visualisasi vertikal perjalanan validasi dokumen (misal: Diajukan -> Disetujui Manager -> Menunggu Finance).

## 6. Area Create Submission (Formulir Pengajuan)

- **Form Input:** _Dropdown_ Jenis Pengajuan, Field Judul, Tampilan Info Divisi (Read-Only).
- **Dinamis:** Bagian bawah form untuk mengisi _item/list_ biaya harus menyesuaikan secara halus (animasi transisi) bila tipe pengajuan diubah. Letakkan validasi _error_ berwarna merah halus presisi di bawah kolom yang salah.

## 7. Area Approval (Daftar Persetujuan)

- **Navigasi Tab:** Layout _Tabs_ di bawah _App Bar_ ("Menunggu" dan "Riwayat").
- **Approval Card:** Modifikasi dari Submission Card. Harus menampilkan Nama Pemohon, Divisi, Type, Grand Total, dan Teks Catatan _(notes)_. Pastikan tata letak nama dan nominal terbungkus layout fleksibel _(Expanded)_ agar bebas dari _text overflow_ (batas 2 baris).
- **Bottom Sheet/Dialog Action:** Saat _card_ ditekan, muncul _pop-up/bottom sheet_ untuk _action_. Berisi ringkasan, _Text Area_ untuk input "Catatan (Wajib jika menolak)", dan dua tombol sejajar: [TOLAK] (Merah) dan [SETUJUI] (Hijau).

## 8. Area Profile

- **Header:** Foto Profil (Avatar melingkar) besar, Nama Lengkap, dan Nama Divisi (Teks, bukan _integer ID_).
- **Tanda Tangan Digital:** Kotak khusus menampilkan _preview_ Tanda Tangan. Berikan teks _placeholder_ jika API mengembalikan tanda tangan kosong.
- **Menu Settings:** Barisan menu bergaya _ListTile_ (Ubah Password, Pengaturan, dsb).
- **Tombol Keluar:** Tombol "Logout" diletakkan di posisi paling bawah dengan jarak ruang yang cukup agar tidak tidak sengaja tersentuh.

---

**Instruksi Spesial AI Visual:**
_Harap perindah semua eleman di atas tanpa mengganggu pondasi hirarkinya. Buat UI yang responsif dan berikan CSS/Flutter Style Code yang reusable!_
