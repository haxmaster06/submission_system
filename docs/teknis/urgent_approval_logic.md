# Implementasi Logika Approval Urgent

## Ringkasan Masalah

Saat ini field `status_urgent` (enum: `urgent` / `normal`) di tabel `submissions` hanya berfungsi sebagai **metadata** tanpa dampak logis terhadap alur persetujuan.

**Perilaku saat ini (Normal):**
```
Pengajuan disimpan → Approver Step 1 dinotifikasi
→ Step 1 Approve → Approver Step 2 dinotifikasi
→ Step 2 Approve → ... → Step N Approve → final_status = approved
```

**Perilaku yang diinginkan (Urgent):**
```
Pengajuan disimpan sebagai Urgent → SEMUA Approver dinotifikasi sekaligus
→ Siapapun bisa approve, tidak harus menunggu urutan
→ Jika Direktur approve terlebih dahulu → semua level di bawahnya otomatis approved
→ Jika approver level rendah approve duluan → normal (tidak mempengaruhi yang lain)
```

---

## User Review Required

> [!IMPORTANT]
> **Aturan "auto-approve" hanya berlaku ke BAWAH.** Jika Direktur (step 4) approve, maka step 1, 2, 3 otomatis approved. Jika GM (step 3) approve duluan, hanya step 1 dan 2 yang ter-auto-approve. **Apakah ini sesuai dengan yang diharapkan?**

> [!WARNING]
> **Perubahan status Normal → Urgent saat pengajuan sudah berjalan:**
> Jika pengajuan sudah berstatus `pending` dan beberapa step sudah diproses, lalu diubah ke Urgent, sistem akan:
> 1. Mengirim notifikasi ke semua approver yang **belum** approve.
> 2. Step yang sudah approved tetap tidak berubah.
>
> **Apakah ini acceptable? Atau perubahan ke Urgent harus diblokir jika sudah ada approval?**

---

## Proposed Changes

### Komponen 1: Backend — Service Layer

---

#### [MODIFY] [ApprovalService.php](file:///home/hbm-server/submission_system/backend/app/Services/ApprovalService.php)

**File ini adalah inti dari semua perubahan.**

##### 1.1 Method: `initializeApprovals()` (Line 30–54)

**Kondisi saat ini:** Hanya mengirim notifikasi ke Approver Step 1.

**Perubahan:**
```diff
 public function initializeApprovals(Submission $submission)
 {
     return DB::transaction(function () use ($submission) {
         $steps = $this->flowBuilder->buildSteps($submission);

         foreach ($steps as $index => $step) {
             SubmissionApproval::create([
                 'submission_id' => $submission->id,
                 'approver_id' => $step['approver_id'],
                 'role_name' => $step['role_name'],
                 'step_order' => $index + 1,
                 'status' => 'pending',
             ]);
         }

-        // Notify First Approver
-        $firstApproval = $submission->approvals->where('step_order', 1)->first();
-        if ($firstApproval) {
-            $approvers = $this->getApproversForRole($firstApproval->role_name);
-            Notification::send($approvers, new NewSubmissionNotification($submission));
-        }
+        if ($submission->status_urgent === 'urgent') {
+            // URGENT: Notifikasi ke SEMUA approver sekaligus
+            $this->notifyAllApprovers($submission);
+        } else {
+            // NORMAL: Notifikasi ke approver step 1 saja
+            $firstApproval = $submission->approvals->where('step_order', 1)->first();
+            if ($firstApproval) {
+                $approvers = $this->getApproversForRole($firstApproval->role_name);
+                Notification::send($approvers, new NewSubmissionNotification($submission));
+            }
+        }

         return $submission->approvals;
     });
 }
```

##### 1.2 Method Baru: `notifyAllApprovers()` 

```php
/**
 * Kirim notifikasi ke SEMUA approver pada pengajuan urgent.
 */
private function notifyAllApprovers(Submission $submission)
{
    $approvals = $submission->approvals()->where('status', 'pending')->get();
    $notifiedUserIds = [];

    foreach ($approvals as $approval) {
        $approvers = $this->getApproversForRole($approval->role_name);
        foreach ($approvers as $approver) {
            if (!in_array($approver->id, $notifiedUserIds)) {
                $approver->notify(new NewSubmissionNotification($submission));
                $notifiedUserIds[] = $approver->id;
            }
        }
    }
}
```

##### 1.3 Method: `approve()` (Line 59–171)

**Kondisi saat ini:** Setelah approve, cek `$nextStep = step_order + 1`. Jika ada → update `current_approval_step` dan notifikasi next approver. Jika tidak → set `final_status = approved`.

**Perubahan:** Tambah branch untuk mode Urgent.

```diff
 public function approve(SubmissionApproval $approval, array $data = [])
 {
     return DB::transaction(function () use ($approval, $data) {
         // ... (existing signature logic unchanged, lines 62-131) ...

         $approval->update([
             'status' => 'approved',
             'approved_at' => now(),
             // ... (unchanged)
         ]);

         $submission = $approval->submission;
-        $nextStep = $approval->step_order + 1;
-
-        $nextApproval = SubmissionApproval::where('submission_id', $submission->id)
-            ->where('step_order', $nextStep)
-            ->first();
-
-        if (!$nextApproval) {
-            $submission->update(['final_status' => 'approved']);
-            $submission->user->notify(new SubmissionStatusNotification($submission, 'approved', $user->name));
-        }
-        else {
-            $submission->update(['current_approval_step' => $nextStep]);
-            $nextApprovers = $this->getApproversForRole($nextApproval->role_name);
-            // ...notify...
-        }
+
+        if ($submission->status_urgent === 'urgent') {
+            $this->handleUrgentApproval($submission, $approval, $user);
+        } else {
+            $this->handleNormalApproval($submission, $approval, $user);
+        }

         AuditTrailService::log(/* ... unchanged ... */);
         return $approval;
     });
 }
```

##### 1.4 Method Baru: `handleNormalApproval()`

Pindahkan logic existing yang sudah ada di `approve()` ke method terpisah, **tanpa perubahan behavior**.

```php
private function handleNormalApproval(Submission $submission, SubmissionApproval $approval, $user)
{
    $nextStep = $approval->step_order + 1;
    $nextApproval = SubmissionApproval::where('submission_id', $submission->id)
        ->where('step_order', $nextStep)
        ->first();

    if (!$nextApproval) {
        $submission->update(['final_status' => 'approved']);
        $submission->user->notify(new SubmissionStatusNotification($submission, 'approved', $user->name));
    } else {
        $submission->update(['current_approval_step' => $nextStep]);
        $nextApprovers = $this->getApproversForRole($nextApproval->role_name);
        if ($nextApprovers->isEmpty()) {
            \Log::warning("No approvers found for role: {$nextApproval->role_name}");
        }
        Notification::send($nextApprovers, new NewSubmissionNotification($submission));
    }
}
```

##### 1.5 Method Baru: `handleUrgentApproval()` — INTI FITUR

```php
/**
 * Untuk mode Urgent:
 * - Jika approver level X approve, semua step di BAWAH level X otomatis approved.
 * - Jika SEMUA step sudah approved → final_status = approved.
 */
private function handleUrgentApproval(Submission $submission, SubmissionApproval $currentApproval, $user)
{
    $currentStepOrder = $currentApproval->step_order;

    // Auto-approve semua step di BAWAH yang masih pending
    $lowerSteps = SubmissionApproval::where('submission_id', $submission->id)
        ->where('step_order', '<', $currentStepOrder)
        ->where('status', 'pending')
        ->get();

    foreach ($lowerSteps as $lowerApproval) {
        $lowerApproval->update([
            'status' => 'approved',
            'approved_at' => now(),
            'notes' => 'Auto-approved (Urgent: disetujui oleh ' . $user->name . ' [' . $currentApproval->role_name . '])',
            'approver_id' => $lowerApproval->approver_id, // Tetap approver asli
        ]);

        AuditTrailService::log(
            'URGENT_AUTO_APPROVE',
            'SubmissionApproval',
            $lowerApproval->id,
            ['triggered_by' => $user->id, 'triggered_step' => $currentStepOrder],
            $lowerApproval->toArray()
        );
    }

    // Cek apakah SEMUA step sudah approved
    $remainingPending = SubmissionApproval::where('submission_id', $submission->id)
        ->where('status', 'pending')
        ->count();

    if ($remainingPending === 0) {
        $submission->update(['final_status' => 'approved']);
        $submission->user->notify(new SubmissionStatusNotification($submission, 'approved', $user->name));
    }

    // Update current_approval_step ke step tertinggi yang masih pending (untuk kompatibilitas UI)
    $highestPending = SubmissionApproval::where('submission_id', $submission->id)
        ->where('status', 'pending')
        ->orderBy('step_order')
        ->first();

    if ($highestPending) {
        $submission->update(['current_approval_step' => $highestPending->step_order]);
    }
}
```

---

### Komponen 2: Backend — Controller Layer

---

#### [MODIFY] [ApprovalController.php](file:///home/hbm-server/submission_system/backend/app/Http/Controllers/Api/ApprovalController.php)

##### 2.1 Method: `authorizeAction()` (Line 147–169)

**Kondisi saat ini:** Memblokir approval jika `current_approval_step !== step_order`.

**Perubahan:** Untuk pengajuan Urgent, izinkan approver pada step MANAPUN untuk approve.

```diff
 private function authorizeAction(SubmissionApproval $approval)
 {
     $user = Auth::user();

     if ($user->hasRole('Super Admin')) {
-        if ($approval->submission->current_approval_step !== $approval->step_order) {
-            abort(400, 'It is not your turn to approve this submission.');
-        }
+        // Super Admin: untuk URGENT, tidak perlu cek step order
+        if ($approval->submission->status_urgent !== 'urgent') {
+            if ($approval->submission->current_approval_step !== $approval->step_order) {
+                abort(400, 'It is not your turn to approve this submission.');
+            }
+        }
+        // Tetap cek apakah approval sudah diproses
+        if ($approval->status !== 'pending' && $approval->status !== 'revised') {
+            abort(400, 'This approval has already been processed.');
+        }
         return;
     }

     $isProxy = $user->hasPermissionTo('proxy director signature') && $approval->role_name === 'Director';

     if ($approval->approver_id !== $user->id && !$isProxy) {
         abort(403, 'Unauthorized action.');
     }

-    if ($approval->submission->current_approval_step !== $approval->step_order) {
-        abort(400, 'It is not your turn to approve this submission.');
-    }
+    // Untuk URGENT: skip step-order check
+    if ($approval->submission->status_urgent !== 'urgent') {
+        if ($approval->submission->current_approval_step !== $approval->step_order) {
+            abort(400, 'It is not your turn to approve this submission.');
+        }
+    }
+
+    // Cek apakah approval sudah diproses
+    if ($approval->status !== 'pending' && $approval->status !== 'revised') {
+        abort(400, 'This approval has already been processed.');
+    }
 }
```

##### 2.2 Method: `pending()` (Line 23–58)

**Kondisi saat ini:** Filter WHERE `current_approval_step = step_order` — hanya tampilkan step yang sedang aktif.

**Perubahan:** Untuk Urgent, tampilkan SEMUA pending approvals (tanpa filter step).

```diff
 $query = SubmissionApproval::with([...])
     ->whereIn('status', ['pending', 'revised'])
-    ->whereHas('submission', function ($q) {
-        $q->whereColumn('submissions.current_approval_step', 'submission_approvals.step_order');
-    });
+    ->whereHas('submission', function ($q) {
+        $q->where(function ($sub) {
+            // Normal: hanya step aktif
+            $sub->where('status_urgent', '!=', 'urgent')
+                ->whereColumn('submissions.current_approval_step', 'submission_approvals.step_order');
+        })->orWhere(function ($sub) {
+            // Urgent: tampilkan semua step yang masih pending
+            $sub->where('status_urgent', 'urgent');
+        });
+    });
```

---

### Komponen 3: Backend — Submission Controller (Perubahan Status)

---

#### [MODIFY] [SubmissionController.php](file:///home/hbm-server/submission_system/backend/app/Http/Controllers/Api/SubmissionController.php)

##### 3.1 Method: `update()` (Line 133–211)

**Perubahan:** Deteksi jika `status_urgent` berubah dari `normal` → `urgent` pada pengajuan yang sudah `pending`, lalu trigger notifikasi ke semua approver yang belum selesai.

```diff
 // Setelah $submission->update($data); (sekitar Line 171)

+// Deteksi perubahan status ke Urgent
+if (
+    $request->input('status_urgent') === 'urgent'
+    && $submission->getOriginal('status_urgent') === 'normal'
+    && $submission->final_status === 'pending'
+) {
+    // Kirim notifikasi ke semua approver yang masih pending
+    app(ApprovalService::class)->notifyAllApprovers($submission);
+    AuditTrailService::log('ESCALATED_TO_URGENT', 'Submission', $submission->id);
+}
```

> [!NOTE]
> Method `notifyAllApprovers()` harus diubah visibility dari `private` ke `public` agar bisa dipanggil dari `SubmissionController`.

---

### Komponen 4: Frontend — Web UI

---

#### [MODIFY] Submission Detail/Approval Timeline (Web)

**File:** Komponen timeline di halaman detail pengajuan.

**Perubahan:**
1. Tambah badge **"Auto-Approved"** pada step yang di-auto-approve oleh fitur Urgent.
2. Deteksi via field `notes` yang berisi prefix `"Auto-approved (Urgent:..."`.
3. Tidak ada perubahan logic form, hanya visual indicator.

---

### Komponen 5: Frontend — Mobile App

---

#### [MODIFY] Submission Detail Screen (Mobile)

**File:** `submission_detail_screen.dart`

**Perubahan:**
1. Tampilkan badge untuk step yang ter-auto-approve (sama seperti Web).
2. Warna badge khusus: Orange/Amber untuk "Auto-Approved".

---

### Komponen 6: Dokumentasi Panduan Pengguna

---

#### [MODIFY] [panduan_pengguna.md](file:///home/hbm-server/submission_system/docs/pengguna/panduan_pengguna.md)

Tambah section baru **"8. Pengajuan Urgent"** setelah section 7:

```markdown
## 8. Pengajuan Urgent

Pengajuan dengan status **Urgent** memiliki alur persetujuan khusus yang dipercepat:

### Perbedaan dengan Pengajuan Normal
| Aspek | Normal | Urgent |
|---|---|---|
| Notifikasi Approver | Satu per satu, berurutan | Sekaligus ke semua approver |
| Urutan Approval | Wajib berurutan (Step 1 → 2 → 3 → ...) | Bebas, tidak harus berurutan |
| Auto-Approve | Tidak ada | Jika approver level tinggi (misal Direktur) menyetujui, semua level di bawahnya otomatis disetujui |

### Cara Menggunakan
1. Saat membuat pengajuan, pilih status **Urgent** pada dropdown "Status Prioritas".
2. Semua approver akan langsung menerima notifikasi.
3. Approver manapun bisa langsung melakukan approve/reject tanpa menunggu giliran.

### Catatan Penting
- Jika **Direktur** menyetujui terlebih dahulu, maka Manager, Finance, dan approver lainnya yang belum approve akan otomatis disetujui oleh sistem.
- Jika **GM** menyetujui terlebih dahulu, hanya level di bawah GM yang otomatis disetujui. Direktur tetap perlu menyetujui secara manual.
- Status pengajuan dapat diubah dari Normal ke Urgent jika pengajuan masih berstatus **Pending** atau **Ditunda**.
```

---

## Verification Plan

### Automated Tests

**File test:** [ApprovalServiceTest.php](file:///home/hbm-server/submission_system/backend/tests/Feature/ApprovalServiceTest.php)

Tambah test cases baru:

1. **`test_urgent_submission_notifies_all_approvers_on_initialize`**
   - Buat submission dengan `status_urgent = 'urgent'`
   - Panggil `initializeApprovals()`
   - Assert: SEMUA approver di setiap step menerima `NewSubmissionNotification`

2. **`test_urgent_director_approve_auto_approves_lower_steps`**
   - Buat submission urgent dengan 4 step (Div → Finance → GM → Director)
   - Login sebagai Director, approve step 4
   - Assert: Step 1, 2, 3 status = `approved`, notes berisi "Auto-approved"
   - Assert: `final_status = approved`

3. **`test_urgent_gm_approve_auto_approves_lower_but_not_director`**
   - Buat submission urgent, login sebagai GM, approve step 3
   - Assert: Step 1, 2 = `approved`
   - Assert: Step 4 (Director) = `pending`
   - Assert: `final_status` masih `pending`

4. **`test_urgent_approver_can_approve_out_of_order`**
   - Buat submission urgent, login sebagai Finance (step 2)
   - Approve step 2 tanpa step 1 terlebih dahulu
   - Assert: Tidak ada error 400, step 2 = `approved`

5. **`test_normal_submission_still_enforces_step_order`**
   - Regression: pastikan pengajuan Normal tetap diblokir jika approve di luar urutan.

**Perintah menjalankan test:**
```bash
docker exec -it backend-app php artisan test --filter=ApprovalServiceTest
```

### Manual Verification

1. **Buat pengajuan Urgent via Web/API** → Verifikasi semua approver menerima notifikasi.
2. **Login sebagai Direktur** → Approve pengajuan → Cek apakah step-step di bawahnya otomatis ter-approve.
3. **Buat pengajuan Normal** → Pastikan alur sequential masih berjalan normal (regression check).
