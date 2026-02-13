# HBM STAFF BUDGETING SYSTEM

CV Hasil Barokah Mandiri

Dokumen ini berisi deliverables lengkap:

1. ERD Diagram
2. Flowchart Approval
3. Prompt Generator AI Coding Agent
4. Struktur Migration Lengkap
5. SOP Approval Internal

---

# 1) ERD DIAGRAM

## Entity Relationship Structure

```
USERS
- id
- name
- email
- password
- division_id
- signature_path
- signature_type
- created_at

DIVISIONS
- id
- name
- code

SUBMISSIONS
- id
- no_pengajuan
- user_id
- division_id
- jenis_pengajuan_id
- jenis_perjalanan_id
- status_urgent
- description
- notes
- qty
- uom_id
- nominal
- total
- tanggal_pengajuan
- current_approval_step
- final_status
- created_at

SUBMISSION_APPROVALS
- id
- submission_id
- approver_id
- role_name
- step_order
- status
- approved_at
- signature_used
- signed_proof_path
- is_director_proxy
- notes

APPROVAL_SIGNATURES
- id
- submission_id
- user_id
- signature_path
- is_director_proxy
- created_at

SUBMISSION_ATTACHMENTS
- id
- submission_id
- file_path
- file_type
- uploaded_by
- created_at

JENIS_PENGAJUAN
- id
- name
- form_schema_json

JENIS_PERJALANAN
- id
- name

UOMS
- id
- name
- code

APPROVAL_FLOWS
- id
- name
- is_active

APPROVAL_FLOW_STEPS
- id
- flow_id
- role_name
- step_order

AUDIT_TRAILS
- id
- user_id
- action
- model
- model_id
- old_data
- new_data
- ip_address
- created_at
```

## Relationship Mapping

* Users → Divisions (Many to One)
* Submissions → Users (Many to One)
* Submissions → Approval Steps (One to Many)
* Submissions → Attachments (One to Many)
* Submissions → Signatures (One to Many)
* Approval Flow → Flow Steps (One to Many)

---

# 2) FLOWCHART APPROVAL

## Approval Master Flow

```
[START]
   ↓
User Create Submission
   ↓
System Generate No Pengajuan
   ↓
Determine Approval Flow
   ↓
Step 1: HRD (Submitter Acknowledge)
   ↓
Step 2: GA Legal Approve?
   ├─ Reject → END (Rejected)
   └─ Approve
   ↓
Step 3: Finance Approve?
   ├─ Reject → END
   └─ Approve
   ↓
Step 4: GM Approve?
   ├─ Reject → END
   └─ Approve
   ↓
Step 5: Director Approval
   ├─ Digital Sign
   ├─ Proxy Finance Sign
   └─ Wet Signature Upload
   ↓
FINAL APPROVED
   ↓
Generate PDF + Archive
   ↓
[END]
```

## Conditional Branch

Jika Jenis Perjalanan = DINAS:

Insert Step:
HRD (GA Legal Capacity)

Flow menjadi:
HRD → GA Legal → HRD(GL) → Finance → GM → Director

---

# 3) PROMPT GENERATOR – AI CODING AGENT

Prompt siap pakai untuk AI Agent (Antigravity / Copilot / GPT Engineer).

```
PROJECT TITLE:
HBM Staff Budgeting System

STACK:
Laravel 12
Filament 5 (Optional Admin Panel)
Livewire Latest
Next.js Frontend
Tailwind CSS
Sanctum Auth
MySQL

PORT DEV:
6090

PROJECT TYPE:
Non Modular Monolith

OBJECTIVE:
Build a Staff Budget Submission & Approval System with dynamic form, multi level approval, digital signature, wet signature verification, attachment upload, audit trail, and PDF reporting.

CORE FEATURES:
1. Submission CRUD
2. Dynamic Form by Jenis Pengajuan
3. Auto Calculation (Qty x Nominal)
4. Auto No Pengajuan Generator
5. Multi Step Approval Engine
6. Digital Signature per User
7. Director Proxy Signature (Finance Only)
8. Wet Signature Proof Upload
9. Attachment Screenshot Upload
10. Audit Trail Logging
11. PDF Reporting
12. Printer Binding Ready

APPROVAL FLOW RULE:
If Submitter = HRD:
HRD → GA Legal → Finance → GM → Director

If Travel Type = Dinas:
Add HRD (GA Legal Capacity)

SECURITY:
- RBAC using Spatie Permission
- Sanctum Token Auth
- Step Approval Locking
- Signature Hash Validation

DATABASE MUST INCLUDE:
users, divisions, submissions, submission_approvals,
approval_signatures, attachments, approval_flows,
approval_flow_steps, audit_trails

UI STYLE:
Professional, Interactive, Modern
Sky Blue Theme
Stepper Approval Timeline
Signature Preview
Auto Calculation

OUTPUT EXPECTATION:
- Clean Architecture
- Service Layer
- Repository Optional
- API Documented via Scramble
- Unit Test Included
```

---

# 4) STRUKTUR MIGRATION LENGKAP

## 4.1 divisions

```php
Schema::create('divisions', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('code');
    $table->timestamps();
});
```

## 4.2 users (extend)

```php
$table->foreignId('division_id')->nullable();
$table->string('signature_path')->nullable();
$table->enum('signature_type',['upload','canvas'])->nullable();
```

## 4.3 submissions

```php
Schema::create('submissions', function (Blueprint $table) {
    $table->id();
    $table->string('no_pengajuan')->unique();
    $table->foreignId('user_id');
    $table->foreignId('division_id');
    $table->foreignId('jenis_pengajuan_id');
    $table->foreignId('jenis_perjalanan_id')->nullable();
    $table->enum('status_urgent',['urgent','normal']);
    $table->text('description');
    $table->text('notes')->nullable();
    $table->decimal('qty',12,2);
    $table->foreignId('uom_id');
    $table->decimal('nominal',15,2);
    $table->decimal('total',15,2);
    $table->dateTime('tanggal_pengajuan');
    $table->integer('current_approval_step')->default(1);
    $table->enum('final_status',['pending','approved','rejected']);
    $table->timestamps();
});
```

## 4.4 submission_approvals

```php
Schema::create('submission_approvals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('submission_id');
    $table->foreignId('approver_id');
    $table->string('role_name');
    $table->integer('step_order');
    $table->enum('status',['pending','approved','rejected']);
    $table->dateTime('approved_at')->nullable();
    $table->string('signature_used')->nullable();
    $table->string('signed_proof_path')->nullable();
    $table->boolean('is_director_proxy')->default(false);
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

## 4.5 attachments

```php
Schema::create('submission_attachments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('submission_id');
    $table->string('file_path');
    $table->string('file_type');
    $table->foreignId('uploaded_by');
    $table->timestamps();
});
```

## 4.6 approval flows

```php
Schema::create('approval_flows', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

## 4.7 approval flow steps

```php
Schema::create('approval_flow_steps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('flow_id');
    $table->string('role_name');
    $table->integer('step_order');
    $table->timestamps();
});
```

## 4.8 audit trails

```php
Schema::create('audit_trails', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id');
    $table->string('action');
    $table->string('model');
    $table->unsignedBigInteger('model_id');
    $table->json('old_data')->nullable();
    $table->json('new_data')->nullable();
    $table->string('ip_address')->nullable();
    $table->timestamps();
});
```

---

# 5) SOP APPROVAL INTERNAL

## 5.1 Pembuatan Pengajuan

1. Staff login sistem
2. Isi form pengajuan
3. Upload bukti jika ada
4. Submit
5. Sistem generate nomor otomatis

---

## 5.2 Proses Approval

### Step Flow

| Step | Role     | Aksi                 |
| ---- | -------- | -------------------- |
| 1    | HRD      | Validasi awal        |
| 2    | GA Legal | Legal check          |
| 3    | Finance  | Budget check         |
| 4    | GM       | Operational approval |
| 5    | Director | Final approval       |

---

## 5.3 Opsi Tanda Tangan Direktur

### Opsi 1 — Digital

Direktur sign langsung di sistem.

### Opsi 2 — Proxy Finance

Finance gunakan signature direktur.
Status: a.n Direktur.

### Opsi 3 — Basah

1. Dokumen dicetak
2. Ditandatangani
3. Scan/upload
4. Attach sebagai proof

---

## 5.4 Reject Flow

Jika reject:

* Wajib isi alasan
* Kembali ke pengaju
* Bisa edit & resubmit
* Approval reset dari awal

---

## 5.5 Reporting

Finance / Admin dapat:

* Export PDF
* Print dokumen
* Lihat timeline approval
* Lihat histori audit

---

# 6) GOVERNANCE & CONTROL

Checklist kontrol internal:

* Approval tidak bisa lompat step
* Signature hanya pemilik akun
* Proxy hanya finance
* Wet sign wajib bukti upload
* Semua aksi tercatat audit trail

---

END OF DOCUMENT
