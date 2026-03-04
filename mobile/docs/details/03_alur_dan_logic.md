# Alur Kerja dan Logika Aplikasi

## 1. Alur Autentikasi

1. **Login**: User memasukkan kredensial -> API mengembalikan JWT Token & Data User (termasuk Role & Permissions).
2. **Persistence**: JWT disimpan di `FlutterSecureStorage`.
3. **Session Check**: Setiap aplikasi dibuka, `checkAuthStatus()` memvalidasi token ke endpoint `/me`.
4. **Authorization**: Interceptor API secara otomatis menyisipkan `Authorization: Bearer <token>` pada setiap request.

## 2. Alur Pengajuan (Submission Flow)

1. **Drafting**: User mengisi informasi dasar (Divisi, Jenis Pengajuan, Deskripsi).
2. **Itemization**:
   - **Tipe Standar**: Menambahkan item detail (QTY, Nominal, UOM).
   - **Tipe Gaji**: Mengisi Matrix Gaji (Karyawan x Tanggal).
3. **Data Storage**: Local state disimpan sebelum akhirnya dikirim ke `/submissions` dengan status `draft`.
4. **Attachment**: Setelah draft sukses, aplikasi mengirim file ke `/submissions/{id}/attachments`.
5. **Completion**: User menekan "Complete" -> Request ke `/submissions/{id}/complete` -> Status berubah menjadi `pending` & Approval Flow dimulai.

## 3. Logika Matrix Gaji

- **Range Generation**: Menghasilkan daftar tanggal antara `startDate` dan `endDate`.
- **Exclusion Logic**: Jika tanggal ditandai tidak aktif (excluded), tanggal tersebut tidak akan muncul di kolom matrix dan tidak dihitung dalam subtotal.
- **Auto-Fill Logic**: `nominal = (Gaji Pokok / 25).roundToDouble()`.
- **Nested State**: Menggunakan `Map<int, Map<String, double>>` untuk menyimpan relasi `employeeId -> {date: nominal}`.

## 4. Alur Approval

1. **Polling/Refetch**: Aplikasi mengambil daftar `approvals` yang ditujukan ke user saat ini.
2. **Decision**: User memberikan input `status` (Approved/Rejected) dan `note`.
3. **Backend Trigger**: API `POST /approvals/{id}/action` memproses logika transisi status di Laravel.

## 5. Logika Peran & Akses (RBAC)

Aplikasi menggunakan kombinasi Role dan Permission untuk mengontrol akses:

- **Roles**: Super Admin, Staff, HRD, GA Legal, Finance, GM, Director. (Catatan: Role **Manager** tidak digunakan dalam sistem ini).
- **Permissions**:
  - `approve submissions` & `reject submissions`: Diperlukan untuk melakukan aksi pada antrean approval.
  - `proxy director signature`: Khusus untuk role **Finance** agar dapat melakukan approval mewakili **Director** (disertai unggah bukti).
- **Field Filtering**:
  - Dropdown "Divisi" hanya bisa diubah oleh `Super Admin`.
  - Jenis Pengajuan "Gaji" hanya muncul jika user memiliki permission `manage employees`.
- **Visibility**: Menampilkan/menyembunyikan aksi dan menu (Master Data, Reports) berdasarkan role/permission yang diterima saat login.
