<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Services\SubmissionService;
use App\Services\ApprovalService;
use App\Services\AuditTrailService;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Requests\UpdateSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    protected $submissionService;
    protected $approvalService;

    public function __construct(SubmissionService $submissionService, ApprovalService $approvalService)
    {
        $this->submissionService = $submissionService;
        $this->approvalService = $approvalService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Submission::query()
            ->addSelect([
                'submissions.*',
                'current_step_role' => SubmissionApproval::select('role_name')
                    ->whereColumn('submission_id', 'submissions.id')
                    ->whereColumn('step_order', 'submissions.current_approval_step')
                    ->limit(1)
            ])
            ->with([
                'user:id,name',
                'division:id,name,code',
                'jenisPengajuan:id,name',
                'items:id,submission_id,description,qty,uom_id,nominal',
                'items.uom:id,name',
                'approvals:id,submission_id,step_order,role_name,status,approver_id',
                'approvals.approver:id,name'
            ])
            ->accessibleBy($user);

        // Filtering Logic
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_pengajuan', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }



        if ($request->filled('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        if ($request->filled('jenis_pengajuan_id')) {
            $query->where('jenis_pengajuan_id', $request->jenis_pengajuan_id);
        }

        if ($request->filled('status_urgent')) {
            $query->where('status_urgent', $request->status_urgent);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_pengajuan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_pengajuan', '<=', $request->date_to);
        }

        if ($request->filled('month')) {
            $query->whereMonth('tanggal_pengajuan', $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('tanggal_pengajuan', $request->year);
        }

        // Clone query for counts before status filter — single query with conditional aggregation
        $countRow = (clone $query)->select([
            DB::raw('COUNT(*) as total'),
            DB::raw("SUM(CASE WHEN final_status = 'draf' THEN 1 ELSE 0 END) as draf"),
            DB::raw("SUM(CASE WHEN final_status = 'pending' THEN 1 ELSE 0 END) as pending"),
            DB::raw("SUM(CASE WHEN final_status = 'approved' THEN 1 ELSE 0 END) as approved"),
            DB::raw("SUM(CASE WHEN final_status = 'rejected' THEN 1 ELSE 0 END) as rejected"),
        ])->first();

        $counts = [
            'all' => (int)($countRow->total ?? 0),
            'draf' => (int)($countRow->draf ?? 0),
            'pending' => (int)($countRow->pending ?? 0),
            'approved' => (int)($countRow->approved ?? 0),
            'rejected' => (int)($countRow->rejected ?? 0),
        ];

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('final_status', $request->status);
        }

        $submissions = $query->latest()->paginate($request->get('per_page', 25));
        
        $submissions->getCollection()->transform(function($submission) {
            return new SubmissionResource($submission);
        });

        return response()->json([
            'submissions' => $submissions,
            'counts' => $counts
        ]);
    }

    public function store(StoreSubmissionRequest $request)
    {
        $user = Auth::user();
        $validated = $request->validated();
        
        $data = $request->except(['items', 'is_draft']);
        $data['user_id'] = $user->id;
        $isDraft = $request->boolean('is_draft', false);
        $data['final_status'] = $isDraft ? 'draf' : 'pending';

        if ($request->has('total')) {
            $data['total'] = $request->total;
        } elseif ($request->has('items') && is_array($request->items) && count($request->items) > 0) {
            $grandTotal = 0;
            foreach ($request->items as $item) {
                $grandTotal += ($item['qty'] * $item['nominal']);
            }
            $data['total'] = $grandTotal;
        }

        if ($request->has('payload') && !empty($request->payload)) {
            $submission = $this->submissionService->createSubmission($data);
        }
        else {
            $submission = $this->submissionService->createSubmissionWithItems($data, $request->items ?? []);
        }

        if (!$isDraft) {
            $this->approvalService->initializeApprovals($submission);
        }

        $actionLog = $isDraft ? 'SAVED_DRAFT' : 'CREATED_AND_PUBLISHED';
        AuditTrailService::log($actionLog, 'Submission', $submission->id, null, $submission->toArray());

        return new SubmissionResource($submission->load(['approvals', 'items.uom']));
    }

    public function update(UpdateSubmissionRequest $request, Submission $submission)
    {
        $this->authorize('update', $submission);

        $validated = $request->validated();
        $isOnHold = $submission->final_status === 'on_hold';
        $isAdminEdit = Auth::user()->hasRole('Super Admin') && Auth::id() !== $submission->user_id;
        $isAdminEditLive = $isAdminEdit && !in_array($submission->final_status, ['draf', 'on_hold']);

        return DB::transaction(function () use ($request, $submission, $isOnHold, $isAdminEdit, $isAdminEditLive) {
            // Capture old data for audit trail comparison
            $oldData = $submission->only(['description', 'notes', 'status_urgent', 'total', 'division_id', 'jenis_pengajuan_id']);

            $data = $request->except(['items', 'is_draft']);
            
            // Preserve the original time part of tanggal_pengajuan if it is being updated/edited
            if (isset($data['tanggal_pengajuan'])) {
                if ($submission->tanggal_pengajuan) {
                    $originalTime = $submission->tanggal_pengajuan->format('H:i:s');
                    try {
                        $parsedNewDate = \Carbon\Carbon::parse($data['tanggal_pengajuan']);
                        $data['tanggal_pengajuan'] = $parsedNewDate->setTimeFromTimeString($originalTime);
                    } catch (\Exception $e) {
                        $data['tanggal_pengajuan'] = $submission->tanggal_pengajuan;
                    }
                } else {
                    try {
                        $parsedNewDate = \Carbon\Carbon::parse($data['tanggal_pengajuan']);
                        if ($parsedNewDate->format('H:i:s') === '00:00:00') {
                            $data['tanggal_pengajuan'] = $parsedNewDate->setTimeFromTimeString(now()->format('H:i:s'));
                        } else {
                            $data['tanggal_pengajuan'] = $parsedNewDate;
                        }
                    } catch (\Exception $e) {
                        unset($data['tanggal_pengajuan']);
                    }
                }
            }

            // Admin editing live submissions must NOT change final_status
            if ($isAdminEditLive) {
                unset($data['final_status']);
            }

            // If total is explicitly provided (e.g. from Salary Matrix), use it.
            // Otherwise, recalculate total ONLY if items are provided and not empty.
            if ($request->has('total')) {
                $data['total'] = $request->total;
            } elseif ($request->has('items') && is_array($request->items) && count($request->items) > 0) {
                $grandTotal = 0;
                foreach ($request->items as $item) {
                    $grandTotal += ($item['qty'] * $item['nominal']);
                }
                $data['total'] = $grandTotal;
            }

            $submission->update($data);

            if ($request->has('items')) {
                $submission->items()->delete();
                foreach ($request->items as $item) {
                    $submission->items()->create($item);
                }
            }

            // Force touch updated_at to reflect latest save regardless of data diff
            $submission->touch();

            // --- Audit Log & Side Effects ---

            if ($isAdminEditLive) {
                // Super Admin editing a live (pending/approved) submission
                // Do NOT reset approvals, do NOT change status — just log with clear marker
                $newData = $submission->only(['description', 'notes', 'status_urgent', 'total', 'division_id', 'jenis_pengajuan_id']);
                AuditTrailService::log('ADMIN_EDITED', 'Submission', $submission->id, $oldData, $newData);
            } elseif ($isOnHold) {
                // Owner or admin revising an on_hold submission
                $submission->update(['final_status' => 'pending']);

                $holdApproval = $submission->approvals()
                    ->where('status', 'on_hold')
                    ->where('step_order', $submission->current_approval_step)
                    ->first();

                if ($holdApproval) {
                    $holdApproval->update(['status' => 'revised']);

                    if ($holdApproval->approver) {
                        $holdApproval->approver->notify(
                            new \App\Notifications\SubmissionRevisedNotification($submission, $submission->user->name)
                        );
                    }
                }

                AuditTrailService::log('REVISED', 'Submission', $submission->id, $oldData, $submission->toArray());
            } else {
                // Normal draft update
                AuditTrailService::log('UPDATED_DRAFT', 'Submission', $submission->id, null, $submission->toArray());
            }

            // Detect escalation to urgent
            if (
                $request->input('status_urgent') === 'urgent'
                && $submission->getOriginal('status_urgent') === 'normal'
                && in_array($submission->final_status, ['pending'])
            ) {
                $this->approvalService->notifyAllApprovers($submission);
                AuditTrailService::log('ESCALATED_TO_URGENT', 'Submission', $submission->id);
            }

            return new SubmissionResource($submission->load('items.uom'));
        });
    }

    public function publish(Submission $submission)
    {
        $this->authorize('update', $submission);

        if ($submission->final_status !== 'draf') {
            return response()->json(['message' => 'Pengajuan sudah diterbitkan atau tidak berstatus draf.'], 400);
        }

        return DB::transaction(function () use ($submission) {
            $division = $submission->division;
            $noPengajuan = $this->submissionService->generateNoPengajuan($division->code);

            $submission->update([
                'final_status' => 'pending',
                'no_pengajuan' => $noPengajuan,
                'tanggal_pengajuan' => now(),
            ]);

            $this->approvalService->initializeApprovals($submission);

            AuditTrailService::log('PUBLISHED', 'Submission', $submission->id, ['status' => 'draf'], ['status' => 'pending', 'no' => $noPengajuan]);

            return response()->json(['message' => 'Pengajuan berhasil diterbitkan.', 'submission' => $submission->load('approvals')]);
        });
    }

    public function show(Submission $submission)
    {
        $this->authorize('view', $submission);
        
        $submission->load(['user', 'division', 'jenisPengajuan', 'items.uom', 'approvals.approver', 'realizations.details', 'attachments', 'attachmentRequests.requestedBy', 'attachmentRequests.targetUser']);
        
        // Add current_step_role manually since it's now a subquery-only attribute for index,
        // but for detail we can still compute it or just use the relation.
        // Let's ensure it's there for the resource.
        $submission->current_step_role = $submission->approvals()
            ->where('step_order', $submission->current_approval_step)
            ->first()?->role_name;

        return new SubmissionResource($submission);
    }

    public function uploadAttachment(Request $request, Submission $submission)
    {
        $this->authorize('uploadAttachment', $submission);

        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx', // Added MIME validation
        ]);

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('attachments', $filename, 'public');

        $attachment = $submission->attachments()->create([
            'file_path' => $path,
            'file_type' => $request->file('file')->getClientOriginalExtension(),
            'uploaded_by' => Auth::id(),
        ]);

        AuditTrailService::log('ATTACHMENT_UPLOADED', 'Submission', $submission->id, null, ['file' => $attachment->file_path]);

        return response()->json($attachment, 201);
    }

    private function generatePdf(Submission $submission, $isPdf = true)
    {
        $submission->load(['user', 'division', 'jenisPengajuan', 'approvals.approver', 'uom', 'items.uom']);

        // Embed Requestor Signature
        $submission->requestor_signature_base64 = $this->getBase64Signature($submission->user->signature_path);

        // Embed Approver Signatures
        foreach ($submission->approvals as $approval) {
            if ($approval->signature_used) {
                $approval->signature_base64 = $this->getBase64Signature($approval->signature_used);
            }
        }

        $isSalary = $submission->payload && isset($submission->payload['employees']);
        $viewName = $isSalary ? 'pdf.submission-salary' : 'pdf.submission';

        if ($isPdf) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($viewName, compact('submission', 'isPdf'))
                ->setPaper('a4', 'portrait');
            return $pdf;
        }

        return view($viewName, compact('submission', 'isPdf'));
    }

    public function downloadPdf(Submission $submission)
    {
        try {
            $pdf = $this->generatePdf($submission);
            return $pdf->download('Submission-' . $submission->no_pengajuan . '.pdf');
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PDF Export Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF'], 500);
        }
    }

    private function getBase64Signature($path)
    {
        if (!$path)
            return null;

        // If stored as URL, try to parse path
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            $parsed = parse_url($path);
            $path = $parsed['path'] ?? '';
            // Remove /storage/ prefix if present
            $path = str_replace('/storage/', '', $path);
        }

        // Clean path
        $path = ltrim($path, '/');

        // Check straight path (e.g. "signatures/file.png")
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            $content = \Illuminate\Support\Facades\Storage::disk('public')->get($path);
            $mime = \Illuminate\Support\Facades\Storage::disk('public')->mimeType($path);
            return 'data:' . $mime . ';base64,' . base64_encode($content);
        }

        // Check with signatures prefix if missing
        if (!str_starts_with($path, 'signatures/') && \Illuminate\Support\Facades\Storage::disk('public')->exists('signatures/' . $path)) {
            $content = \Illuminate\Support\Facades\Storage::disk('public')->get('signatures/' . $path);
            $mime = \Illuminate\Support\Facades\Storage::disk('public')->mimeType('signatures/' . $path);
            return 'data:' . $mime . ';base64,' . base64_encode($content);
        }

        return null;
    }

    public function previewPdf(Submission $submission)
    {
        try {
            $pdf = $this->generatePdf($submission, true);

            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="Submission-' . $submission->no_pengajuan . '.pdf"',
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
            ]);
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PDF Preview Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF'], 500);
        }
    }

    public function printHtml(Submission $submission)
    {
        try {
            $view = $this->generatePdf($submission, false);

            return response($view)
                ->header('Content-Type', 'text/html')
                ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                ->header('Pragma', 'no-cache');
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('HTML Print Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate print view'], 500);
        }
    }

    public function getPreviewUrl(Submission $submission)
    {
        $user = Auth::user();
        // Basic authorization check
        $canView = $user->hasAnyRole(['Super Admin', 'Finance', 'GM', 'Director']) || $submission->user_id === $user->id;

        if (!$canView) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'api.submissions.preview',
            now()->addMinutes(30),
        ['submission' => $submission->id]
        );

        return response()->json(['url' => $url]);
    }

    public function getPrintUrl(Submission $submission)
    {
        $user = Auth::user();
        $canView = $user->hasAnyRole(['Super Admin', 'Finance', 'GM', 'Director']) || $submission->user_id === $user->id;

        if (!$canView) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'api.submissions.print',
            now()->addMinutes(30),
        ['submission' => $submission->id]
        );

        return response()->json(['url' => $url]);
    }

    /**
     * Delete a submission (privileged roles only).
     */
    public function destroy(Submission $submission)
    {
        $this->authorize('delete', $submission);

        // Delete related attachments from storage
        foreach ($submission->attachments as $attachment) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
        }

        // Cascade delete related records
        $submission->items()->delete();
        $submission->approvals()->delete();
        $submission->attachments()->delete();

        AuditTrailService::log('DELETED', 'Submission', $submission->id, $submission->toArray(), null);

        $submission->delete();

        return response()->json(['message' => 'Pengajuan berhasil dihapus.']);
    }

    /**
     * Mark a submission as completed manually.
     */
    public function complete(Submission $submission)
    {
        $user = Auth::user();

        // Only privileged roles/permissions can mark as completed
        if (!$user->can('complete submissions')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menyelesaikan pengajuan ini.'], 403);
        }

        // Only approved submissions can be marked as completed
        if ($submission->final_status !== 'approved') {
            return response()->json(['message' => 'Hanya pengajuan yang sudah disetujui yang dapat diselesaikan.'], 400);
        }

        $submission->update(['is_completed' => true]);

        AuditTrailService::log('COMPLETED', 'Submission', $submission->id, ['is_completed' => false], ['is_completed' => true]);

        return response()->json(['message' => 'Pengajuan berhasil ditandai selesai.', 'submission' => $submission]);
    }

    /**
     * Delete multiple submissions.
     */
    public function bulkDelete(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:submissions,id',
        ]);

        $submissions = \App\Models\Submission::whereIn('id', $request->ids)->get();
        $count = 0;

        foreach ($submissions as $submission) {
            // Check if user is authorized to delete this specific submission
            if ($user->can('delete', $submission)) {
                // Delete related attachments from storage
                foreach ($submission->attachments as $attachment) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
                }

                // Cascade delete related records
                $submission->items()->delete();
                $submission->approvals()->delete();
                $submission->attachments()->delete();

                \App\Services\AuditTrailService::log('BULK_DELETED', 'Submission', $submission->id, $submission->toArray(), null);

                $submission->delete();
                $count++;
            }
        }

        if ($count === 0 && count($request->ids) > 0) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus pengajuan yang dipilih.'], 403);
        }

        return response()->json(['message' => "{$count} pengajuan berhasil dihapus."]);
    }
}