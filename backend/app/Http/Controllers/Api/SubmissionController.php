<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Services\SubmissionService;
use App\Services\ApprovalService;
use App\Services\AuditTrailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        $query = Submission::with(['user', 'division', 'jenisPengajuan', 'items.uom', 'approvals.approver', 'realizations.details']);

        // Only Super Admin, Finance, GM, Director can see all submissions
        // Only Super Admin or users with 'view reports' permission can see all submissions
        $canSeeAll = $user->hasRole('Super Admin') || $user->can('view reports');
        
        if (!$canSeeAll) {
            $query->where('user_id', $user->id);
        }

        // Filtering Logic
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('no_pengajuan', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('final_status', $request->status);
        }

        if ($request->filled('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        if ($request->filled('jenis_pengajuan_id')) {
            $query->where('jenis_pengajuan_id', $request->jenis_pengajuan_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_pengajuan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_pengajuan', '<=', $request->date_to);
        }

        // Clone query for counts before status filter
        $countQuery = (clone $query);
        $counts = [
            'all' => $countQuery->count(),
            'pending' => (clone $countQuery)->where('final_status', 'pending')->count(),
            'approved' => (clone $countQuery)->where('final_status', 'approved')->count(),
            'rejected' => (clone $countQuery)->where('final_status', 'rejected')->count(),
        ];

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('final_status', $request->status);
        }

        $paginated = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'submissions' => $paginated,
            'counts' => $counts
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'jenis_pengajuan_id' => 'required|exists:jenis_pengajuan,id',
            'jenis_perjalanan_id' => 'nullable|exists:jenis_perjalanan,id',
            'status_urgent' => 'required|exists:urgency_statuses,code',
            'description' => 'required|string',
            'notes' => 'nullable|string',
            // Items validation (max 20 items)
            'items' => 'required|array|min:1|max:20',
            'items.*.description' => 'required|string|max:500',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.uom_id' => 'required|exists:uoms,id',
            'items.*.nominal' => 'required|numeric|min:0',
        ]);

        $data = $request->except('items');
        $data['user_id'] = Auth::id();

        $submission = $this->submissionService->createSubmissionWithItems($data, $request->items);
        $this->approvalService->initializeApprovals($submission);

        AuditTrailService::log('CREATED', 'Submission', $submission->id, null, $submission->toArray());

        return response()->json($submission->load(['approvals', 'items.uom']), 201);
    }

    public function show(Submission $submission)
    {
        $this->authorize('view', $submission);
        return response()->json($submission->load(['user', 'division', 'jenisPengajuan', 'jenisPerjalanan', 'uom', 'items.uom', 'approvals.approver', 'attachments']));
    }

    public function uploadAttachment(Request $request, Submission $submission)
    {
        $this->authorize('uploadAttachment', $submission);

        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx', // Added MIME validation
        ]);

        $path = $request->file('file')->store('attachments', 'public');

        $attachment = $submission->attachments()->create([
            'file_path' => $path,
            'file_type' => $request->file('file')->getClientOriginalExtension(),
            'uploaded_by' => Auth::id(),
        ]);

        AuditTrailService::log('ATTACHMENT_UPLOADED', 'Submission', $submission->id, null, ['file' => $attachment->file_path]);

        return response()->json($attachment, 201);
    }

    private function generatePdf(Submission $submission)
    {
        $this->authorize('view', $submission);
        $submission->load(['user', 'division', 'jenisPengajuan', 'approvals.approver', 'uom', 'items.uom']);
        $isPdf = true;
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.submission', compact('submission', 'isPdf'))
            ->setPaper('a4', 'portrait');

        return $pdf;
    }

    public function downloadPdf(Submission $submission)
    {
        try {
            $pdf = $this->generatePdf($submission);
            return $pdf->download('Submission-'.$submission->no_pengajuan.'.pdf');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PDF Export Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF'], 500);
        }
    }

    public function previewPdf(Submission $submission)
    {
        try {
            $submission->load(['user', 'division', 'jenisPengajuan', 'approvals.approver', 'uom', 'items.uom']);
            
            // Embed signatures as Base64 to avoid path/URL issues in PDF
            foreach($submission->approvals as $approval) {
                if($approval->signature_used) {
                    $path = $approval->signature_used;
                    // If stored as URL, try to parse path
                    if (filter_var($path, FILTER_VALIDATE_URL)) {
                        $parsed = parse_url($path);
                        $path = $parsed['path'] ?? '';
                        // Remove /storage/ prefix if present to get relative path in storage/app/public
                        $path = str_replace('/storage/', '', $path);
                    }
                    
                    // Check if file exists in public disk
                    if(\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                        $content = \Illuminate\Support\Facades\Storage::disk('public')->get($path);
                        $mime = \Illuminate\Support\Facades\Storage::disk('public')->mimeType($path);
                        $base64 = 'data:' . $mime . ';base64,' . base64_encode($content);
                        $approval->signature_base64 = $base64;
                    }
                }
            }

            $pdf = $this->generatePdf($submission); // generatePdf will use the modified submission object
            
            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="Submission-'.$submission->no_pengajuan.'.pdf"',
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0', 
                'Pragma' => 'no-cache',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PDF Preview Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF'], 500);
        }
    }

    public function printHtml(Submission $submission)
    {
        try {
            $submission->load(['user', 'division', 'jenisPengajuan', 'approvals.approver', 'uom', 'items.uom']);
            $isPdf = false;
            
            // Embed signatures as Base64 for reliable printing
            foreach($submission->approvals as $approval) {
                if($approval->signature_used) {
                    $path = $approval->signature_used;
                    // If stored as URL, try to parse path
                    if (filter_var($path, FILTER_VALIDATE_URL)) {
                        $parsed = parse_url($path);
                        $path = $parsed['path'] ?? '';
                         // Remove /storage/ prefix if present
                        $path = str_replace('/storage/', '', $path);
                        // Also remove leading slash just in case
                        $path = ltrim($path, '/');
                    }
                    
                    // Check if file exists in public disk
                    if(\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                        $content = \Illuminate\Support\Facades\Storage::disk('public')->get($path);
                        $mime = \Illuminate\Support\Facades\Storage::disk('public')->mimeType($path);
                        $base64 = 'data:' . $mime . ';base64,' . base64_encode($content);
                        $approval->signature_base64 = $base64;
                    }
                }
            }

            return response()->view('pdf.submission', compact('submission', 'isPdf'))
                ->header('Content-Type', 'text/html')
                ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                ->header('Pragma', 'no-cache');
        } catch (\Exception $e) {
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
        $user = Auth::user();

        // Only privileged roles/permissions can delete
        if (!$user->can('delete submissions')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus pengajuan.'], 403);
        }

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
}
