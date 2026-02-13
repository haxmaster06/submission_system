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

            // Handle Proof if proxy
            if ($data['is_director_proxy'] ?? false) {
                $proofPath = $this->saveBase64Image($proofPath, 'proofs');
                
                // LOGIC: Use Director's signature if available
                $director = User::role('Director')->first();

                if ($director && $director->signature_path) {
                    // Start: Use Director's existing signature
                    $signaturePath = $director->signature_path;
                    
                    // Notify Director that their signature was used by Proxy
                    Notification::send($director, new ProxySignedNotification($approval->submission, $user->name));
                    
                    // End: Use Director's existing signature
                } else {
                    // Fallback: Use the one uploaded by proxy OR proxy's saved signature
                     if ($signaturePath && str_contains($signaturePath, 'data:image')) {
                        $signaturePath = $this->saveBase64Image($signaturePath, 'signatures');
                    } elseif (!$signaturePath) {
                        // If no new signature provided, use Proxy's existing signature
                        $signaturePath = $user->signature_path;
                    }
                }
            } else {
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
                } else {
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
            $nextStep = $approval->step_order + 1;
            
            $nextApproval = SubmissionApproval::where('submission_id', $submission->id)
                ->where('step_order', $nextStep)
                ->first();

            if (!$nextApproval) {
                $submission->update(['final_status' => 'approved']);
                
                // Notify Requestor of Final Approval
                $submission->user->notify(new SubmissionStatusNotification($submission, 'approved', $user->name));
            } else {
                $submission->update(['current_approval_step' => $nextStep]);
                
                // Notify user that it moved to next step (Optional, maybe too spammy? keeping it simple for now)
                
                // Notify Next Approvers
                $nextApprovers = $this->getApproversForRole($nextApproval->role_name);
                
                if ($nextApprovers->isEmpty()) {
                    \Illuminate\Support\Facades\Log::warning("No approvers found for role: {$nextApproval->role_name} in submission {$submission->code}");
                }

                Notification::send($nextApprovers, new NewSubmissionNotification($submission));
            }

            AuditTrailService::log('approve', 'SubmissionApproval', $approval->id, null, $approval->toArray());

            return $approval;
        });
    }

    private function getApproversForRole($roleName)
    {
        // Robust handling for 'GA Legal' to catch variations or split roles
        if ($roleName === 'GA Legal') {
            return User::whereHas('roles', function($q) {
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
}
