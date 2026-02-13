# HBM BUDGET REALIZATION FEATURE

CV Hasil Barokah Mandiri

Dokumen ini khusus membahas fitur Realisasi Anggaran yang terintegrasi di dalam sistem HBM Budgeting System sebagai lanjutan dari proses pengajuan.

Isi dokumen:

1. Konsep Realisasi
2. Struktur Database
3. Alur Proses
4. Perhitungan & Komparasi
5. Grafik Pembanding
6. Dashboard & KPI
7. Governance & Control

---

# 1) KONSEP REALISASI

Realisasi adalah pencatatan penggunaan aktual dari anggaran yang telah disetujui.

Posisi fitur dalam lifecycle sistem:

Submission → Approved → Realization Input → Monitoring → Reporting

Tujuan:

* Mengukur serapan anggaran
* Membandingkan estimasi vs aktual
* Deteksi over budget
* Financial control

---

# 2) STRUKTUR DATABASE

## 2.1 realization_headers

```php
Schema::create('realization_headers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('submission_id');
    $table->date('realization_date');
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

## 2.2 realization_details

```php
Schema::create('realization_details', function (Blueprint $table) {
    $table->id();
    $table->foreignId('realization_id');
    $table->string('item_name');
    $table->decimal('qty',12,2);
    $table->decimal('nominal',15,2);
    $table->decimal('total',15,2);
    $table->timestamps();
});
```

Relasi:

* 1 Submission → Many Realizations
* 1 Realization → Many Details

---

# 3) ALUR PROSES REALISASI

```
Approved Submission
        ↓
Finance Input Realization
        ↓
Upload Bukti (Optional)
        ↓
System Calculate Total
        ↓
Comparison Engine
        ↓
Dashboard & Reporting
```

Hak akses:

| Role     | Akses     |
| -------- | --------- |
| Finance  | Full CRUD |
| GM       | View      |
| Director | View      |

---

# 4) PERHITUNGAN & KOMPARASI

## Field Perbandingan

| Field           | Source                |
| --------------- | --------------------- |
| Total Pengajuan | submissions.total     |
| Total Realisasi | SUM realization       |
| Selisih         | Pengajuan − Realisasi |
| Status          | Under / Over / Exact  |

## Formula

```
selisih = total_pengajuan - total_realisasi

IF selisih > 0 → UNDER
IF selisih = 0 → EXACT
IF selisih < 0 → OVER
```

---

# 5) GRAFIK PEMBANDING

## 5.1 Bar Chart — Pengajuan vs Realisasi

Dimensi:

* X Axis: No Pengajuan / Divisi
* Y Axis: Nominal

Series:

* Pengajuan
* Realisasi

---

## 5.2 Pie / Donut — Budget Utilization

Komposisi:

* Used Budget
* Remaining Budget

---

## 5.3 Over Budget Monitoring

Tabel indikator:

| Submission | Pengajuan | Realisasi | Status |
| ---------- | --------- | --------- | ------ |
| AJU‑001    | 10 jt     | 12 jt     | OVER   |

---

# 6) DATASET QUERY

```sql
SELECT
 s.no_pengajuan,
 s.total AS pengajuan,
 COALESCE(SUM(rd.total),0) AS realisasi,
 s.total - COALESCE(SUM(rd.total),0) AS selisih
FROM submissions s
LEFT JOIN realization_headers rh ON rh.submission_id = s.id
LEFT JOIN realization_details rd ON rd.realization_id = rh.id
GROUP BY s.id;
```

---

# 7) DASHBOARD & KPI

## KPI Metrics

* Total Pengajuan Bulanan
* Total Realisasi Bulanan
* % Serapan Budget
* Over Budget Count
* Under Budget Value

---

# 8) GOVERNANCE & CONTROL

Kontrol sistem:

* Fitur realisasi hanya aktif untuk submission berstatus approved
* Tidak bisa melebihi threshold tanpa flag
* Wajib bukti jika over budget
* Audit trail setiap input

---

END OF DOCUMENT
