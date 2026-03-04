<?php

namespace App\Policies;

use App\Models\Submission;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SubmissionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Finance', 'GM', 'Director']) || $user->can('view reports');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Submission $submission): bool
    {
        // Owner can always view
        if ($user->id === $submission->user_id) {
            return true;
        }

        // Privileged roles can always view
        if ($user->hasAnyRole(['Super Admin', 'Finance', 'GM', 'Director'])) {
            return true;
        }
        
        // Approvers involved in the submission can view
        if ($submission->approvals()->where(['approver_id' => $user->id])->exists()) {
            return true;
        }

        // Target users of attachment requests can view
        if ($submission->attachmentRequests()->where(['target_user_id' => $user->id, 'status' => 'pending'])->exists()) {
            return true;
        }

        // Check for 'view reports' permission as a fallback
        return $user->can('view reports');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create submissions');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Submission $submission): bool
    {
        // Only owner can update if status is pending or draft (if we had draft)
        // For now, let's say updates are allowed if it hasn't been finalized
        if ($user->id === $submission->user_id) {
             // Maybe restrict updates if already approved/rejected?
             // For now, keeping it basic: Owner can edit.
             return true; 
        }

        return $user->hasRole('Super Admin');
    }

    public function delete(User $user, Submission $submission): bool
    {
        // Owner can ONLY delete if it's still a draft
        if ($user->id === $submission->user_id && $submission->final_status === 'draf') {
            return true;
        }

        // If it's NOT a draft (Published/Terbit), 
        // it can only be deleted by those with explicit permission
        return $user->can('delete submissions');
    }
    
    /**
     * Determine if user can upload attachment
     */
    public function uploadAttachment(User $user, Submission $submission): bool
    {
        // Same as view permissions essentially, plus owner
        return $this->view($user, $submission);
    }
    /**
     * Determine whether the user can request an attachment for the submission.
     */
    public function requestAttachment(User $user, Submission $submission): bool
    {
        // Owner can request
        if ($user->id === $submission->user_id) {
            return true;
        }

        // Super Admin or users with 'request attachments' permission
        return $user->hasRole('Super Admin') || $user->hasPermissionTo('request attachments');
    }
}
