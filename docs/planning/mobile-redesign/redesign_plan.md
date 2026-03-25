# Planning: Redesign Mobile App HBM Budgeting (Full Version)

> **Versi**: 2.0  
> **Tanggal**: 25 Maret 2026  
> **Referensi Mockup**: `mockup/mobile_apps/Mobile Budgeting/`  
> **Codebase**: `mobile/lib/`

---

## 1. Ringkasan

Redesign lengkap mobile app dengan tiga tujuan utama:
1. **Visual Redesign** — Ubah tampilan mengikuti referensi mockup (warna, layout, navigasi)
2. **Feature Parity** — Semua fitur yang ada di Web tersedia juga di Mobile
3. **Approve Only Mode** — Mode khusus untuk Approver yang fokus hanya pada persetujuan

---

## 2. Gap Analysis: Web vs Mobile

### Fitur Web yang SUDAH Ada di Mobile ✅
| Fitur Web | Screen Mobile |
|-----------|--------------|
| Beranda/Dashboard | `dashboard_screen.dart` |
| Buat Pengajuan Baru | `submission_form_screen.dart` |
| Pengajuan Saya | `submissions_screen.dart` |
| Detail Pengajuan | `submission_detail_screen.dart` |
| Persetujuan | `approvals_screen.dart` |
| Profil | `profile_screen.dart` |
| Ganti Password | `change_password_screen.dart` |
| Notifikasi | `notification_screen.dart` |

### Fitur Web yang BELUM Ada di Mobile ❌
| No | Fitur Web | Prioritas | Catatan |
|----|-----------|-----------|---------|
| 1 | Pengajuan Gaji (Salary) | 🔴 Tinggi | Form berbeda (matrix gaji harian) |
| 2 | Monitoring Realisasi | 🔴 Tinggi | Lihat & input realisasi |
| 3 | Master Data (CRUD Divisi/UoM/Jenis) | 🟡 Sedang | Admin-only, bisa read-only di mobile |
| 4 | Alur Persetujuan | 🟡 Sedang | Config flow approval, admin-only |
| 5 | Data Karyawan | 🟡 Sedang | CRUD karyawan |
| 6 | Reporting/Laporan | 🟡 Sedang | Bisa summary view |
| 7 | Manajemen User | 🟠 Rendah | Super Admin only |
| 8 | Peran & Hak Akses | 🟠 Rendah | Super Admin only |
| 9 | Audit Log | 🟠 Rendah | Super Admin only |
| 10 | Mobile Apps Management | ⚪ Skip | Meta/self-referential, tidak perlu |
| 11 | Panduan Pengguna / Manual | 🟡 Sedang | Bisa WebView atau native page |

### Fitur BARU (Tidak Ada di Web) 🆕
| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | **Approve Only Mode** | Mode fokus untuk Approver, hanya tampilkan antrean persetujuan |
| 2 | **Activity History** | Riwayat aktivitas budget (sesuai mockup) |

---

## 3. Fase Implementasi (Sequential)

### FASE 1: Design System Update
> **Tujuan**: Update theme global agar sesuai mockup (Deep Purple)

#### Step 1.1 — Update `mobile/lib/core/theme/ui_kit.dart`

```dart
// SEBELUM:
static const Color primaryBlue = Color(0xFF3F3D9E);
static const Color primaryGradientStart = Color(0xFF302E82);
static const Color primaryGradientEnd = Color(0xFF3F3D9E);

// SESUDAH:
static const Color primaryBlue = Color(0xFF6A1B9A);     // Deep Purple
static const Color primaryGradientStart = Color(0xFF4A148C);
static const Color primaryGradientEnd = Color(0xFF7B1FA2);
```

> Tidak perlu rename variabel. Semua file yang reference `UiKit.primaryBlue` otomatis berubah.

#### Step 1.2 — Verifikasi `mobile/lib/core/theme/app_theme.dart`
- Pastikan tidak ada warna hardcoded. File ini hanya reference `UiKit.*`, jadi otomatis ikut.

---

### FASE 2: Bottom Navigation + Approve Only Mode
> **Tujuan**: Ubah navigasi bawah menjadi 5 tab + FAB center. Implementasi mode switching untuk Approver.

#### Step 2.1 — Buat Provider untuk App Mode

**File BARU**: `mobile/lib/core/providers/app_mode_provider.dart`

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppMode { full, approveOnly }

class AppModeNotifier extends StateNotifier<AppMode> {
  AppModeNotifier() : super(AppMode.full) {
    _loadFromStorage();
  }

  static const _key = 'app_mode';

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);
    if (saved == 'approveOnly') state = AppMode.approveOnly;
  }

  Future<void> toggle() async {
    final newMode = state == AppMode.full ? AppMode.approveOnly : AppMode.full;
    state = newMode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, newMode == AppMode.approveOnly ? 'approveOnly' : 'full');
  }

  Future<void> setMode(AppMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, mode == AppMode.approveOnly ? 'approveOnly' : 'full');
  }
}

final appModeProvider = StateNotifierProvider<AppModeNotifier, AppMode>(
  (ref) => AppModeNotifier(),
);
```

**Behavior Approve Only Mode:**
- Saat aktif, Bottom Nav hanya tampilkan **2 tab**: Persetujuan (home) + Profil
- Dashboard diganti dengan halaman Persetujuan langsung
- User masih bisa switch kembali ke mode lengkap dari Profil
- Preferensi tersimpan via `SharedPreferences` → persist saat app ditutup & dibuka lagi
- **Hanya tersedia untuk role Approver** (HRD, GA Legal, Finance, GM, Director, Super Admin)

#### Step 2.2 — Redesign `mobile/lib/shared/widgets/main_wrapper.dart`

**Mode Full (5 Tab + FAB):**
```
[Beranda] [Aktivitas] [+FAB] [Anggaran] [Profil]
```

| Tab | Icon | Route | Deskripsi |
|-----|------|-------|-----------|
| Beranda | `home` | `/dashboard` | Dashboard utama |
| Aktivitas | `list_alt` | `/submissions` | Daftar pengajuan |
| ACTION (FAB) | `add` | `/submissions/new` | Buat pengajuan baru |
| Anggaran | `account_balance_wallet` | `/budget` | Ringkasan anggaran & realisasi |
| Profil | `person` | `/profile` | Profil & pengaturan |

Untuk Approver, tab "Persetujuan" muncul di atas tab Anggaran atau sebagai badge di Beranda.

**Mode Approve Only (2 Tab):**
```
[Persetujuan] [Profil]
```

| Tab | Icon | Route | Deskripsi |
|-----|------|-------|-----------|
| Persetujuan | `fact_check` | `/approvals` | Halaman persetujuan (jadi home) |
| Profil | `person` | `/profile` | Profil + tombol switch mode |

#### Step 2.3 — Update `mobile/lib/core/config/app_router.dart`

- Tambah branch baru untuk `/budget` (Anggaran screen)
- Tambah route `/activity-history`
- Router harus responsif terhadap `appModeProvider` untuk mode switching

---

### FASE 3: Redesign Dashboard (Home Screen)
> **Tujuan**: Ubah dari statistik + chart → Grid launcher + System Feed + Search

**File**: `mobile/lib/features/dashboard/views/dashboard_screen.dart`

#### Step 3.1 — Header: Total Budget + Quick Actions

```
┌──────────────────────────────────────┐
│ Total Anggaran      [Ajukan][Setujui]│
│ Rp150.000.000       [Kirim] [Inbox]  │
└──────────────────────────────────────┘
```

Quick action mapping (tampil dynamic berdasar permission):

| Icon | Label | Aksi | Syarat Permission |
|------|-------|------|-------------------|
| 📝 | Ajukan | `/submissions/new` | `create submissions` |
| ✅ | Setujui | `/approvals` | `approve submissions` |
| 📋 | Riwayat | `/submissions` | Semua |
| 🔔 | Inbox | `/notifications` | Semua |

#### Step 3.2 — Admin/Menu Tools Grid (4 kolom)

Widget `GridView.count(crossAxisCount: 4)` yang merender menu berdasar permission:

| Icon | Label | Route | Syarat |
|------|-------|-------|--------|
| 📋 | Pengajuan | `/submissions` | Semua |
| ➕ | Buat Baru | `/submissions/new` | `create submissions` |
| ✅ | Persetujuan | `/approvals` | Approver role |
| 📊 | Anggaran | `/budget` | `view reports` / Division+ |
| 💰 | Realisasi | `/realizations` | `manage realizations` / `monitor realizations` |
| 👥 | Karyawan | `/employees` | `manage employees` |
| 📈 | Laporan | `/reporting` | `view reports` |
| ⏰ | Riwayat | `/activity-history` | Semua |
| ⊞ | Lihat Semua | expand grid | Semua |

**Admin-only items** (hanya Super Admin):

| Icon | Label | Route |
|------|-------|-------|
| 🗄️ | Master Data | `/master-data` |
| 🔀 | Alur Approval | `/approval-flow` |
| 👤 | Kelola User | `/admin/users` |
| 🔐 | Hak Akses | `/admin/roles` |
| 📝 | Audit Log | `/admin/audit-logs` |

#### Step 3.3 — System Feed

Menampilkan 5 item terbaru dari `data['activities']` + `data['pending_tasks']`:
```dart
Widget _buildSystemFeed(List items) {
  // [Icon berwarna] + [Teks 1 baris] + [Timestamp]
}
```

#### Step 3.4 — Search Bar (bawah System Feed)

```dart
TextField(
  hintText: 'Cari Pengajuan...',
  prefixIcon: Icon(Icons.search),
  onSubmitted: (q) => context.push('/submissions?search=$q'),
)
```

---

### FASE 4: Redesign Profile / Me Screen
> **Tujuan**: Grid menu + income/expense summary + mode switcher

**File**: `mobile/lib/features/profile/views/profile_screen.dart`

#### Step 4.1 — Header: User Info + Role Badge

```
┌───────────────────────────────────┐
│  [Avatar Initial]                  │
│  Nama User                         │
│  email@domain.com                  │
│  ⭐ Finance (role badge)           │
└───────────────────────────────────┘
```

#### Step 4.2 — Grid Menu (3 kolom)

| Icon | Label | Aksi |
|------|-------|------|
| 💰 | Anggaran | Navigate `/budget` |
| 📋 | Pengajuan | Navigate `/submissions` |
| 📊 | Aktivitas | Navigate `/activity-history` |
| 🎯 | Target | Modal info budget limit divisi |
| 👥 | Tim | Modal info divisi |
| ⏰ | Riwayat | Navigate `/submissions?filter=approved` |

#### Step 4.3 — Approve/Realisasi Summary

```
┌────────────────────────────────────┐
│  ↑ Disetujui        ↓ Realisasi   │
│  Rp5.500.000        Rp2.150.000   │
└────────────────────────────────────┘
```

Data dari Dashboard API: `budget.total_approved` & `budget.total_realized`.

#### Step 4.4 — Mode Switcher (KHUSUS APPROVER)

```
┌────────────────────────────────────┐
│ 🔄 Mode Aplikasi              >   │
│    Saat ini: Mode Lengkap          │
│    [Tap untuk switch]              │
└────────────────────────────────────┘
```

Implementasi:
```dart
if (user.isApprover)
  ListTile(
    leading: Icon(Icons.swap_horiz),
    title: Text('Mode Aplikasi'),
    subtitle: Text(
      mode == AppMode.approveOnly 
        ? 'Approve Only — Fokus persetujuan saja'
        : 'Mode Lengkap — Semua fitur tersedia'
    ),
    trailing: Switch(
      value: mode == AppMode.approveOnly,
      onChanged: (_) => ref.read(appModeProvider.notifier).toggle(),
    ),
  ),
```

**Persistent**: Menggunakan `SharedPreferences`, jadi ketika user tutup app lalu buka lagi (tanpa logout), posisi mode tetap sama.

#### Step 4.5 — List Menu Settings

```
📋 Pengajuan Saya           >
🔔 Notifikasi               >
🔑 Ganti Password           >
ℹ️ Informasi Umum            >
───────────────────────────────
🚪 KELUAR DARI APLIKASI
```

---

### FASE 5: Screen Baru — Fitur Web yang Belum Ada

#### Step 5.1 — Activity History Screen (Prioritas Tinggi)

**File BARU**: `mobile/lib/features/submissions/views/activity_history_screen.dart`

Layout sesuai mockup `budget_activity_history.png`:
- AppBar: "Riwayat Aktivitas" + search icon + filter icon
- Search bar
- Monthly summary: "Bulan Ini: -Rp X,XXX,XXX"
- Transaction list: Icon berwarna + deskripsi + nominal + tanggal

Data source: Endpoint existing `/submissions` dikelompokkan per bulan di frontend.

#### Step 5.2 — Budget/Anggaran Screen (Prioritas Tinggi)

**File BARU**: `mobile/lib/features/budget/views/budget_screen.dart`

Konten: Pindahkan chart & stat dari dashboard lama ke sini:
- Stat grid (Total Anggaran, Menunggu, Disetujui, Realisasi)
- Trend Chart (6 bulan — Anggaran vs Realisasi)
- Kategori Pie Chart
- Division Ranking (management scope)

Data source: Dashboard API existing (`/dashboard/stats` atau `/admin/dashboard-stats`).

#### Step 5.3 — Monitoring Realisasi Screen (Prioritas Tinggi)

**File BARU**: `mobile/lib/features/realizations/views/realization_list_screen.dart`

Konten:
- List pengajuan yang sudah `approved` / `completed`
- Setiap item menampilkan: no pengajuan, total disetujui, total realisasi, sisa
- Tap → Detail realisasi (bisa input realisasi baru jika punya permission)

Data source: Endpoint `/submissions?status=approved` + `/submissions/{id}/realizations`.

#### Step 5.4 — Salary Submission Screen (Prioritas Tinggi)

**File BARU**: `mobile/lib/features/submissions/views/salary_form_screen.dart`

Konten: Form pengajuan gaji harian (matrix)
- Pilih karyawan (multi-select atau otomatis dari divisi)
- Input hari kerja per karyawan
- Kalkulasi otomatis total

Data source: Endpoint `/submissions` dengan payload type `salary`.

#### Step 5.5 — Reporting Screen (Prioritas Sedang)

**File BARU**: `mobile/lib/features/reporting/views/reporting_screen.dart`

Konten: Ringkasan laporan (read-only)
- Filter periode
- Summary card: total pengajuan, disetujui, ditolak, realisasi
- List pengajuan per periode

Data source: Endpoint existing `/reports/*`.

#### Step 5.6 — Employee Management Screen (Prioritas Sedang)

**File BARU**: `mobile/lib/features/employees/views/employee_list_screen.dart`

Konten: CRUD karyawan
- List karyawan dengan search
- Tambah/edit karyawan (nama, jabatan, gaji pokok, tunjangan)

Data source: Endpoint existing `/employees`.

#### Step 5.7 — Master Data Screen (Prioritas Sedang, Admin Only)

**File BARU**: `mobile/lib/features/admin/views/master_data_screen.dart`

Konten: CRUD Divisi, Jenis Pengajuan, Jenis Perjalanan, UoM
- Tab-based view per kategori
- Tambah/edit/hapus item

Data source: Endpoint existing `/master/*`.

#### Step 5.8 — Admin Screens (Prioritas Rendah, Super Admin Only)

File baru yang diperlukan:
- `mobile/lib/features/admin/views/user_management_screen.dart` — CRUD User
- `mobile/lib/features/admin/views/role_permission_screen.dart` — View/edit roles
- `mobile/lib/features/admin/views/audit_log_screen.dart` — Read-only audit log
- `mobile/lib/features/admin/views/approval_flow_screen.dart` — Config approval flow

Ini bisa dikerjakan terakhir karena Super Admin umumnya akses via Web.

---

### FASE 6: Cleanup & Final Integration

#### Step 6.1 — Update Router

**File**: `mobile/lib/core/config/app_router.dart`

Tambah semua route baru:
```dart
GoRoute(path: '/budget', builder: ... => BudgetScreen()),
GoRoute(path: '/activity-history', builder: ... => ActivityHistoryScreen()),
GoRoute(path: '/realizations', builder: ... => RealizationListScreen()),
GoRoute(path: '/submissions/salary/new', builder: ... => SalaryFormScreen()),
GoRoute(path: '/reporting', builder: ... => ReportingScreen()),
GoRoute(path: '/employees', builder: ... => EmployeeListScreen()),
GoRoute(path: '/master-data', builder: ... => MasterDataScreen()),
GoRoute(path: '/admin/users', builder: ... => UserManagementScreen()),
GoRoute(path: '/admin/roles', builder: ... => RolePermissionScreen()),
GoRoute(path: '/admin/audit-logs', builder: ... => AuditLogScreen()),
GoRoute(path: '/approval-flow', builder: ... => ApprovalFlowScreen()),
```

#### Step 6.2 — Hapus FAB dari `submissions_screen.dart`

Sudah dipindah ke bottom nav center.

#### Step 6.3 — Test Semua Screen

- Verifikasi navigasi dari grid launcher ke setiap screen
- Verifikasi Approve Only mode toggle & persistence
- Verifikasi mode switching tidak merusak state
- Test di ukuran layar berbeda (5", 6.5", tablet)

---

## 4. Approve Only Mode — Detail Spesifikasi

### Apa itu Approve Only Mode?
Mode khusus untuk user dengan role Approver (HRD, GA Legal, Finance, GM, Director). Saat diaktifkan:

| Aspek | Mode Lengkap | Mode Approve Only |
|-------|-------------|-------------------|
| Bottom Nav | 5 tab + FAB | 2 tab (Persetujuan + Profil) |
| Home Screen | Dashboard lengkap | Langsung halaman Persetujuan |
| Buat Pengajuan | Tersedia | Disembunyikan |
| Anggaran/Budget | Tersedia | Disembunyikan |
| Grid Launcher | Semua menu | Tidak ada |
| Persetujuan | Tab terpisah | Jadi halaman utama |

### Mekanisme Penyimpanan
```
SharedPreferences key: 'app_mode'
Nilai: 'full' | 'approveOnly'
```

### Flow User
```
1. User login → Cek SharedPreferences → Load mode terakhir
2. Jika 'approveOnly' → Tampilkan UI minimal (2 tab)
3. Jika 'full' → Tampilkan UI lengkap (5 tab + FAB)
4. User bisa switch via toggle di halaman Profil
5. Preferensi tersimpan otomatis
6. User tutup app → Buka lagi → Mode tetap sesuai terakhir
7. User logout → Mode di-reset ke 'full' (best practice)
```

### Kapan Tersedia
Hanya tampil jika user memiliki SALAH SATU dari permission/role berikut:
- `approve submissions`
- `reject submissions`
- Role: HRD, GA Legal, Finance, GM, Director, Super Admin

---

## 5. Urutan Eksekusi (Prioritas)

```
FASE 1 (Theme)
    ↓
FASE 2 (Bottom Nav + Approve Mode)
    ↓
FASE 3 (Dashboard Redesign)
    ↓
FASE 4 (Profile Redesign)
    ↓
FASE 5.1-5.3 (Activity, Budget, Realisasi) ← Prioritas Tinggi
    ↓
FASE 5.4 (Salary Submission) ← Prioritas Tinggi
    ↓
FASE 5.5-5.7 (Reporting, Employee, Master Data) ← Prioritas Sedang
    ↓
FASE 5.8 (Admin Screens) ← Prioritas Rendah
    ↓
FASE 6 (Cleanup & Test)
```

---

## 6. File Summary

### File Dimodifikasi
| File | Fase |
|------|------|
| `core/theme/ui_kit.dart` | 1 |
| `core/theme/app_theme.dart` | 1 |
| `shared/widgets/main_wrapper.dart` | 2 |
| `core/config/app_router.dart` | 2, 6 |
| `features/dashboard/views/dashboard_screen.dart` | 3 |
| `features/profile/views/profile_screen.dart` | 4 |
| `features/submissions/views/submissions_screen.dart` | 6 |

### File Baru
| File | Fase |
|------|------|
| `core/providers/app_mode_provider.dart` | 2 |
| `features/submissions/views/activity_history_screen.dart` | 5.1 |
| `features/budget/views/budget_screen.dart` (+provider, repo) | 5.2 |
| `features/realizations/views/realization_list_screen.dart` | 5.3 |
| `features/submissions/views/salary_form_screen.dart` | 5.4 |
| `features/reporting/views/reporting_screen.dart` (+provider) | 5.5 |
| `features/employees/views/employee_list_screen.dart` (+provider, repo) | 5.6 |
| `features/admin/views/master_data_screen.dart` | 5.7 |
| `features/admin/views/user_management_screen.dart` | 5.8 |
| `features/admin/views/role_permission_screen.dart` | 5.8 |
| `features/admin/views/audit_log_screen.dart` | 5.8 |
| `features/admin/views/approval_flow_screen.dart` | 5.8 |

---

## 7. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Terlalu banyak screen baru → delay | Prioritaskan Fase 1-4 + 5.1-5.3. Admin screen (5.8) terakhir |
| Approve Only mode crash saat switch | Gunakan GoRouter redirect + guard check |
| SharedPreferences corrupt | Fallback ke `AppMode.full` jika value tidak dikenali |
| Screen admin di mobile kurang ergonomis | CRUD admin bisa read-only di mobile, create/edit redirect ke web |
| Salary form complex di layar kecil | Gunakan stepper/wizard pattern |

---

## 8. Catatan Penting

1. **JANGAN** ubah business logic (providers, repositories, models) kecuali untuk screen baru
2. **JANGAN** hapus fitur existing sebelum replacement screen siap
3. **PASTIKAN** semua navigasi di-guard berdasar permission (sama seperti web)
4. **Approve Only Mode** harus bisa di-toggle tanpa logout/restart
5. **SharedPreferences** harus di-clear saat logout (`authProvider.logout()`)
6. **Mockup adalah referensi visual**, bukan spec final. Mapping ke fitur HBM yang sesuai
