<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Services\AuditTrailService;
use App\Services\ApprovalFlowBuilder;

use App\Notifications\SubmissionStatusNotification;
use App\Notifications\NewSubmissionNotification;
use App\Notifications\ProxySignedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class ApprovalService
{
    private ApprovalFlowBuilder $flowBuilder;

    public function __construct(ApprovalFlowBuilder $flowBuilder)
    {
        $this->flowBuilder = $flowBuilder;
    }

    /**
     * Initialize approval steps for a new submission.
     */
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

            if ($submission->status_urgent === 'urgent') {
                // URGENT: Notifikasi ke SEMUA approver sekaligus
                $this->notifyAllApprovers($submission);
            } else {
                // NORMAL: Notifikasi ke approver step 1 saja
                $firstApproval = $submission->approvals->where('step_order', 1)->first();
                if ($firstApproval) {
                    $approvers = $this->getApproversForRole($firstApproval->role_name);
                    Notification::send($approvers, new NewSubmissionNotification($submission));
                }
            }

            return $submission->approvals;
        });
    }

    /**
     * Process an approval action.
     */
    public function approve(SubmissionApproval $approval, array $data = [])
    {
        return DB::transaction(function () use ($approval, $data) {
            $user = Auth::user();
            $signaturePath = $data['signature_path'] ?? null;
            $proofPath = $data['signed_proof_path'] ?? null;
            $isSuperAdminOverride = false;

            // SUPER ADMIN OVERRIDE: Use selected user's signature
            if ($user->hasRole('Super Admin') && !empty($data['override_user_id'])) {
                $overrideUser = User::find($data['override_user_id']);
                if ($overrideUser && $overrideUser->signature_path) {
                    $signaturePath = $overrideUser->signature_path;
                    $isSuperAdminOverride = true;
                }
            }
            // Handle Proof if proxy
            elseif ($data['is_director_proxy'] ?? false) {
                $proofPath = $this->saveBase64Image($proofPath, 'proofs');

                // LOGIC: Use Director's signature if available
                $director = User::role('Director')->first();

                if ($director && $director->signature_path) {
                    // Start: Use Director's existing signature
                    $signaturePath = $director->signature_path;

                    // Notify Director that their signature was used by Proxy
                    Notification::send($director, new ProxySignedNotification($approval->submission, $user->name));

                // End: Use Director's existing signature
                }
                else {
                    // Fallback: Use the one uploaded by proxy OR proxy's saved signature
                    if ($signaturePath && str_contains($signaturePath, 'data:image')) {
                        $signaturePath = $this->saveBase64Image($signaturePath, 'signatures');
                    }
                    elseif (!$signaturePath) {
                        // If no new signature provided, use Proxy's existing signature
                        $signaturePath = $user->signature_path;
                    }
                }
            }
            else {
                // Normal Approval Logic
                if ($signaturePath) {
                    if (str_contains($signaturePath, 'data:image')) {
                        $signaturePath = $this->saveBase64Image($signaturePath, 'signatures');

                        // Save to user profile if they don't have one yet
                        if (!$user->signature_path) {
                            $user->update([
                                'signature_path' => $signaturePath,
                                'signature_type' => $data['signature_type'] ?? 'canvas',
                            ]);
                        }
                    }
                }
                else {
                    // Fallback to user's saved signature
                    $signaturePath = $user->signature_path;
                }
            }

            $approval->update([
                'status' => 'approved',
                'approved_at' => now(),
                'signature_used' => $signaturePath,
                'signed_proof_path' => $proofPath,
                'is_director_proxy' => $data['is_director_proxy'] ?? false,
                'notes' => $data['notes'] ?? null,
                'approver_id' => $user->id, // Set the actual user who approved
            ]);

            $submission = $approval->submission;
            
            if ($submission->status_urgent === 'urgent') {
                $this->handleUrgentApproval($submission, $approval, $user);
            } else {
                $this->handleNormalApproval($submission, $approval, $user);
            }

            AuditTrailService::log(
                $isSuperAdminOverride ? 'SUPER_ADMIN_OVERRIDE' : 'approve',
                'SubmissionApproval',
                $approval->id,
                $isSuperAdminOverride ? ['override_user_id' => $data['override_user_id'], 'admin_id' => $user->id] : null,
                $approval->toArray()
            );

            return $approval;
        });
    }

    /**
     * Kirim notifikasi ke SEMUA approver pada pengajuan urgent.
     */
    public function notifyAllApprovers(Submission $submission)
    {
        $approvals = $submission->approvals()->whereIn('status', ['pending', 'revised', 'on_hold'])->get();
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

    private function handleNormalApproval(Submission $submission, SubmissionApproval $approval, $user)
    {
        $nextStep = $approval->step_order + 1;

        $nextApproval = SubmissionApproval::where('submission_id', $submission->id)
            ->where('step_order', $nextStep)
            ->first();

        if (!$nextApproval) {
            $submission->update(['final_status' => 'approved']);

            // Notify Requestor of Final Approval
            $submission->user->notify(new SubmissionStatusNotification($submission, 'approved', $user->name));
        }
        else {
            $submission->update(['current_approval_step' => $nextStep]);

            // Notify Next Approvers
            $nextApprovers = $this->getApproversForRole($nextApproval->role_name);

            if ($nextApprovers->isEmpty()) {
                \Illuminate\Support\Facades\Log::warning("No approvers found for role: {$nextApproval->role_name} in submission {$submission->code}");
            }

            Notification::send($nextApprovers, new NewSubmissionNotification($submission));
        }
    }

    /**
     * Untuk mode Urgent:
     * - Jika approver level X approve, semua step di BAWAH level X otomatis approved.
     * - Jika SEMUA step sudah approved → final_status = approved.
     */
    private function handleUrgentApproval(Submission $submission, SubmissionApproval $currentApproval, $user)
    {
        $currentStepOrder = $currentApproval->step_order;


        // Auto-approve semua step di BAWAH yang masih pending HANYA JIKA yang menyetujui adalah Direktur
        if ($currentApproval->role_name === 'Director') {
            $lowerSteps = SubmissionApproval::where('submission_id', $submission->id)
                ->where('step_order', '<', $currentStepOrder)
                ->whereIn('status', ['pending', 'revised'])
                ->get();


            foreach ($lowerSteps as $lowerApproval) {
                $approverUser = User::find($lowerApproval->approver_id);
                $signaturePath = $approverUser ? $approverUser->signature_path : null;

                $lowerApproval->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                    'signature_used' => $signaturePath,
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
        }

        // Cek apakah SEMUA step sudah approved
        $remainingPending = SubmissionApproval::where('submission_id', $submission->id)
            ->whereIn('status', ['pending', 'revised', 'on_hold'])
            ->count();

        if ($remainingPending === 0) {
            $submission->update(['final_status' => 'approved']);
            $submission->user->notify(new SubmissionStatusNotification($submission, 'approved', $user->name));
        }

        // Update current_approval_step ke step tertinggi yang masih pending (untuk kompatibilitas UI)
        $highestPending = SubmissionApproval::where('submission_id', $submission->id)
            ->whereIn('status', ['pending', 'revised', 'on_hold'])
            ->orderBy('step_order')
            ->first();

        if ($highestPending) {
            $submission->update(['current_approval_step' => $highestPending->step_order]);
        }
    }

    private function getApproversForRole($roleName)
    {
        // Robust handling for 'GA Legal' to catch variations or split roles
        if ($roleName === 'GA Legal') {
            return User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['GA Legal', 'GA', 'Legal']);
            })->get();
        }

        return User::role($roleName)->get();
    }

    /**
     * Helper to save base64 image to storage.
     */
    private function saveBase64Image($base64Data, $folder)
    {
        if (!$base64Data || !str_contains($base64Data, 'data:image')) {
            return $base64Data;
        }

        $imageData = preg_replace('#^data:image/\w+;base64,#i', '', $base64Data);
        $imageContent = base64_decode($imageData);
        $fileName = $folder . '/' . \Illuminate\Support\Str::random(10) . '_' . time() . '.png';
        \Illuminate\Support\Facades\Storage::disk('public')->put($fileName, $imageContent);

        return $fileName;
    }

    /**
     * Process a rejection action.
     */
    public function reject(SubmissionApproval $approval, array $data)
    {
        return DB::transaction(function () use ($approval, $data) {
            $user = Auth::user();

            $approval->update([
                'status' => 'rejected',
                'approved_at' => now(),
                'notes' => $data['notes'] ?? 'Rejected',
                'approver_id' => $user->id,
            ]);

            $submission = $approval->submission;
            $submission->update(['final_status' => 'rejected']);

            // Notify Requestor of Rejection
            $submission->user->notify(new SubmissionStatusNotification($submission, 'rejected', $user->name));

            AuditTrailService::log('reject', 'SubmissionApproval', $approval->id, null, $approval->toArray());

            return $approval;
        });
    }

    /**
     * Process a hold (tunda) action.
     * Sets approval to on_hold and notifies the submission owner to revise.
     */
    public function hold(SubmissionApproval $approval, array $data)
    {
        return DB::transaction(function () use ($approval, $data) {
            $user = Auth::user();

            // Jika yang menunda adalah Super Admin, biarkan approver_id tetap pada PIC aslinya
            $approverId = $user->hasRole('Super Admin') ? $approval->approver_id : $user->id;

            $approval->update([
                'status' => 'on_hold',
                'notes' => $data['notes'] ?? 'Ditunda',
                'approver_id' => $approverId,
            ]);

            $submission = $approval->submission;
            $submission->update(['final_status' => 'on_hold']);

            // Notify submission owner to revise
            $submission->user->notify(
                new \App\Notifications\SubmissionHeldNotification($submission, $user->name, $data['notes'] ?? '')
            );

            AuditTrailService::log('hold', 'SubmissionApproval', $approval->id, null, $approval->toArray());

            return $approval;
        });
    }
}