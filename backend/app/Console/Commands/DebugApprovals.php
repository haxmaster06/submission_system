<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Services\ApprovalService;

class DebugApprovals extends Command
{
    protected $signature = 'debug:approvals';
    protected $description = 'Debug approval initialization';

    public function handle()
    {
        $this->info('=== Checking Users by Role ===');
        $roles = ['HRD', 'GA Legal', 'Finance', 'GM', 'Director'];
        
        foreach ($roles as $role) {
            $user = User::role($role)->first();
            $this->line("$role: " . ($user ? "ID {$user->id} - {$user->name}" : 'NOT FOUND'));
        }
        
        $this->newLine();
        $this->info('=== Checking Submissions & Approvals ===');
        $submissions = Submission::count();
        $approvals = SubmissionApproval::count();
        
        $this->line("Total Submissions: $submissions");
        $this->line("Total Approvals: $approvals");
        
        if ($submissions > 0) {
            $firstSub = Submission::with('approvals')->first();
            $this->newLine();
            $this->info("=== First Submission (ID: {$firstSub->id}) ===");
            $this->line("Current Step: {$firstSub->current_approval_step}");
            $this->line("Final Status: {$firstSub->final_status}");
            $this->line("Approvals: {$firstSub->approvals->count()}");
            
            if ($firstSub->approvals->count() > 0) {
                foreach ($firstSub->approvals as $app) {
                    $this->line("  Step {$app->step_order}: {$app->role_name} (Approver ID: {$app->approver_id}, Status: {$app->status})");
                }
            } else {
                $this->warn('  No approvals found for this submission!');
            }
        }
        
        return 0;
    }
}
