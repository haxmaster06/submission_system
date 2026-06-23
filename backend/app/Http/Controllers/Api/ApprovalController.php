<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubmissionApproval;
use App\Services\ApprovalService;
use App\Http\Resources\ApprovalResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApprovalController extends Controller
{
    protected $approvalService;

    public function __construct(ApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    /**
     * List submissions waiting for current user's approval.
     */
    public function pending(Request $request)
    {
        $user = Auth::user();

        $query = SubmissionApproval::with([
            'submission' => function($q) {
                $q->addSelect([
                    'submissions.*',
                    'current_step_role' => SubmissionApproval::select('role_name')
                        ->whereColumn('submission_id', 'submissions.id')
                        ->whereColumn('step_order', 'submissions.current_approval_step')
                        ->limit(1)
                ])->with(['user:id,name', 'division:id,name', 'items:id,submission_id,description,qty,uom_id,nominal', 'items.uom:id,name']);
            }
        ])
            ->whereIn('status', ['pending', 'revised']);

        // Super Admin sees ALL pending approvals
        if ($user->hasRole('Super Admin')) {
        // No additional filter — show everything
        }
        // If user is a proxy for director, include director-level approvals
        elseif ($user->hasPermissionTo('proxy director signature')) {
            $query->where(function ($q) use ($user) {
                $q->where('approver_id', $user->id)
                    ->orWhere('role_name', 'Director');
            });
        }
        else {
            $query->where(function ($q) use ($user) {
                $q->where('approver_id', $user->id)
                  ->orWhereIn('role_name', $user->getRoleNames());
            });
        }

        $query->whereHas('submission', function ($q) {
            $q->where(function ($sub) {
                // Normal: hanya step aktif
                $sub->where('status_urgent', '!=', 'urgent')
                    ->whereColumn('submissions.current_approval_step', 'submission_approvals.step_order');
            })->orWhere(function ($sub) {
                // Urgent: tampilkan semua step yang masih pending
                $sub->where('status_urgent', 'urgent');
            });
        });

        $approvals = $query->latest()
            ->paginate($request->query('per_page', 25));

        return response()->json(
            ApprovalResource::collection($approvals)->response()->getData(true)
        );
    }

    /**
     * List submissions that have already been handled (approved/rejected) by the current user.
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        $query = SubmissionApproval::with([
            'submission' => function($q) {
                $q->addSelect([
                    'submissions.*',
                    'current_step_role' => SubmissionApproval::select('role_name')
                        ->whereColumn('submission_id', 'submissions.id')
                        ->whereColumn('step_order', 'submissions.current_approval_step')
                        ->limit(1)
                ])->with(['user:id,name', 'division:id,name', 'items:id,submission_id,description,qty,uom_id,nominal', 'items.uom:id,name']);
            }
        ])
            ->where('status', '!=', 'pending');

        // Super Admin sees ALL history
        if ($user->hasRole('Super Admin')) {
        // No additional filter
        }
        // Check proxy logic for history
        elseif ($user->hasPermissionTo('proxy director signature')) {
            $query->where(function ($q) use ($user) {
                $q->where('approver_id', $user->id)
                    ->orWhere('role_name', 'Director');
            });
        }
        else {
            $query->where(function ($q) use ($user) {
                $q->where('approver_id', $user->id)
                  ->orWhereIn('role_name', $user->getRoleNames());
            });
        }

        $history = $query->latest('updated_at')
            ->paginate($request->query('per_page', 25));

        return response()->json(
            ApprovalResource::collection($history)->response()->getData(true)
        );
    }

    public function bulkApprove(Request $request)
    {
        $request->validate([
            'approval_ids' => 'required|array',
            'approval_ids.*' => 'integer|exists:submission_approvals,id',
            'notes' => 'nullable|string',
            'signature_path' => 'nullable|string',
            'signed_proof_path' => 'nullable|string',
            'is_director_proxy' => 'boolean',
            'override_user_id' => 'nullable|integer|exists:users,id',
        ]);

        $user = Auth::user();
        if ($request->input('is_director_proxy') && !$user->hasRole('Super Admin') && !$request->input('signed_proof_path')) {
            return response()->json([
                'message' => 'Bukti tanda tangan wajib diunggah untuk persetujuan mewakili Direktur.'
            ], 422);
        }

        $results = [];
        \Illuminate\Support\Facades\DB::transaction(function () use ($request, &$results) {
            foreach ($request->approval_ids as $id) {
                $approval = SubmissionApproval::find($id);
                if (!$approval) continue;

                $this->authorizeAction($approval);
                $results[] = $this->approvalService->approve($approval, $request->all());
            }
        });

        return response()->json([
            'message' => 'Bulk approval processed successfully.',
            'data' => $results
        ]);
    }

    public function approve(Request $request, SubmissionApproval $approval)
    {
        $this->authorizeAction($approval);

        $request->validate([
            'notes' => 'nullable|string',
            'signature_path' => 'nullable|string',
            'signed_proof_path' => 'nullable|string',
            'is_director_proxy' => 'boolean',
            'override_user_id' => 'nullable|integer|exists:users,id', // Super Admin override
        ]);

        // Mandatory proof if acting as proxy (not Super Admin)
        $user = Auth::user();
        if ($request->input('is_director_proxy') && !$user->hasRole('Super Admin') && !$request->input('signed_proof_path')) {
            return response()->json([
                'message' => 'Bukti tanda tangan wajib diunggah untuk persetujuan mewakili Direktur.'
            ], 422);
        }

        $result = $this->approvalService->approve($approval, $request->all());

        return response()->json($result);
    }

    public function reject(Request $request, SubmissionApproval $approval)
    {
        $this->authorizeAction($approval);

        $request->validate([
            'notes' => 'required|string',
        ]);

        $result = $this->approvalService->reject($approval, $request->all());

        return response()->json($result);
    }

    public function checkDirectorSignature()
    {
        $director = \App\Models\User::role('Director')->first();

        return response()->json([
            'has_signature' => $director && !empty($director->signature_path),
            'director_name' => $director ? $director->name : null
        ]);
    }

    private function authorizeAction(SubmissionApproval $approval)
    {
        $user = Auth::user();

        // Super Admin can always act on any approval
        if ($user->hasRole('Super Admin')) {
            // Only check step order
            if ($approval->submission->current_approval_step !== $approval->step_order) {
                abort(400, 'It is not your turn to approve this submission.');
            }
            return;
        }

        $isProxy = $user->hasPermissionTo('proxy director signature') && $approval->role_name === 'Director';

        if ($approval->approver_id !== $user->id && !$isProxy && !$user->hasRole($approval->role_name)) {
            abort(403, 'Unauthorized action.');
        }

        // Untuk URGENT: skip step-order check
        if ($approval->submission->status_urgent !== 'urgent') {
            if ($approval->submission->current_approval_step !== $approval->step_order) {
                abort(400, 'It is not your turn to approve this submission.');
            }
        }

        // Cek apakah approval sudah diproses
        if ($approval->status !== 'pending' && $approval->status !== 'revised') {
            abort(400, 'This approval has already been processed.');
        }
    }

    public function hold(Request $request, SubmissionApproval $approval)
    {
        $this->authorizeAction($approval);

        $request->validate([
            'notes' => 'required|string',
        ]);

        $result = $this->approvalService->hold($approval, $request->all());

        return response()->json($result);
    }
}