<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubmissionApproval;
use App\Services\ApprovalService;
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
            'submission.user',
            'submission.division',
            'submission.uom',
            'submission.items.uom',
            'submission.approvals.approver' // Load timeline data
        ])
            ->where('status', 'pending')
            ->whereHas('submission', function ($q) {
            $q->whereColumn('submissions.current_approval_step', 'submission_approvals.step_order');
        });

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
            $query->where('approver_id', $user->id);
        }

        $approvals = $query->latest()
            ->paginate(10);

        return response()->json($approvals);
    }

    /**
     * List submissions that have already been handled (approved/rejected) by the current user.
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        $query = SubmissionApproval::with([
            'submission.user',
            'submission.division',
            'submission.uom',
            'submission.items.uom',
            'submission.approvals.approver' // Load timeline data
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
            $query->where('approver_id', $user->id);
        }

        $approvals = $query->latest('updated_at')
            ->paginate(10);

        return response()->json($approvals);
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

        if ($approval->approver_id !== $user->id && !$isProxy) {
            abort(403, 'Unauthorized action.');
        }

        if ($approval->submission->current_approval_step !== $approval->step_order) {
            abort(400, 'It is not your turn to approve this submission.');
        }
    }
}