<?php

namespace Tests\Feature;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Models\User;
use App\Models\Division;
use App\Models\JenisPengajuan;
use App\Models\UrgencyStatus;
use App\Models\ApprovalFlow;
use App\Models\ApprovalFlowStep;
use App\Services\ApprovalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UrgentApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Reset Spatie cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Ensure ONLY our test flow is default/active
        ApprovalFlow::query()->update(['is_default' => false, 'is_active' => false]);
        
        // Roles
        Role::firstOrCreate(['name' => 'HRD']);
        Role::firstOrCreate(['name' => 'Finance']);
        Role::firstOrCreate(['name' => 'GM']);
        Role::firstOrCreate(['name' => 'Director']);

        // Master Data
        Division::firstOrCreate(['code' => 'OPS'], ['name' => 'Operations']);
        JenisPengajuan::firstOrCreate(['name' => 'Umum']);
        UrgencyStatus::firstOrCreate(['code' => 'normal'], ['name' => 'Normal']);
        UrgencyStatus::firstOrCreate(['code' => 'urgent'], ['name' => 'Urgent']);

        // Default Flow
        $flow = ApprovalFlow::create([
            'name' => 'Test Flow',
            'is_default' => true,
            'is_active' => true,
        ]);
        
        $flow->steps()->createMany([
            ['role_name' => 'HRD',      'step_order' => 1, 'is_optional' => false],
            ['role_name' => 'Finance',  'step_order' => 2, 'is_optional' => false],
            ['role_name' => 'GM',       'step_order' => 3, 'is_optional' => false],
            ['role_name' => 'Director', 'step_order' => 4, 'is_optional' => false],
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_notifies_all_approvers_for_urgent_submission()
    {
        Notification::fake();

        $hrd = User::factory()->create(); $hrd->assignRole('HRD');
        $fin = User::factory()->create(); $fin->assignRole('Finance');
        $gm = User::factory()->create();  $gm->assignRole('GM');
        $dir = User::factory()->create(); $dir->assignRole('Director');

        $submission = Submission::factory()->create([
            'status_urgent' => 'urgent',
            'final_status' => 'pending'
        ]);

        app(ApprovalService::class)->initializeApprovals($submission);

        foreach ([$hrd, $fin, $gm, $dir] as $u) {
            Notification::assertSentTo($u, \App\Notifications\NewSubmissionNotification::class);
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_auto_approves_all_lower_steps_when_director_approves_urgent_submission()
    {
        $hrd = User::factory()->create(); $hrd->assignRole('HRD');
        $fin = User::factory()->create(); $fin->assignRole('Finance');
        $gm = User::factory()->create();  $gm->assignRole('GM');
        $dir = User::factory()->create(); $dir->assignRole('Director');

        $submission = Submission::factory()->create([
            'status_urgent' => 'urgent',
            'final_status' => 'pending'
        ]);

        app(ApprovalService::class)->initializeApprovals($submission);
        
        $directorApproval = $submission->approvals()->where('role_name', 'Director')->first();
        $resolvedDir = User::find($directorApproval->approver_id);
        
        $this->actingAs($resolvedDir);
        app(ApprovalService::class)->approve($directorApproval, ['signature_path' => 'data:image/png;base64,abc']);

        $submission->refresh();
        
        // ALL steps should be approved (cascade works for Director)
        $this->assertEquals(4, $submission->approvals()->where('status', 'approved')->count());
        $this->assertEquals('approved', $submission->final_status);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_does_not_auto_approve_lower_steps_when_gm_approves_urgent_submission()
    {
        $hrd = User::factory()->create(); $hrd->assignRole('HRD');
        $fin = User::factory()->create(); $fin->assignRole('Finance');
        $gm = User::factory()->create();  $gm->assignRole('GM');
        $dir = User::factory()->create(); $dir->assignRole('Director');

        $submission = Submission::factory()->create([
            'status_urgent' => 'urgent',
            'final_status' => 'pending'
        ]);

        app(ApprovalService::class)->initializeApprovals($submission);

        $gmApproval = $submission->approvals()->where('role_name', 'GM')->first();
        $resolvedGm = User::find($gmApproval->approver_id);
        
        $this->actingAs($resolvedGm);
        app(ApprovalService::class)->approve($gmApproval, ['signature_path' => 'data:image/png;base64,abc']);

        $submission->refresh();
        
        // ONLY GM step should be approved (cascade does NOT work for non-Director)
        $this->assertEquals(1, $submission->approvals()->where('status', 'approved')->count());
        $this->assertEquals('pending', $submission->final_status);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_allows_out_of_order_approval_for_urgent_submission_via_controller()
    {
        $hrd = User::factory()->create(); $hrd->assignRole('HRD');
        $fin = User::factory()->create(); $fin->assignRole('Finance');

        $submission = Submission::factory()->create([
            'status_urgent' => 'urgent',
            'final_status' => 'pending'
        ]);

        app(ApprovalService::class)->initializeApprovals($submission);

        $financeApproval = $submission->approvals()->where('role_name', 'Finance')->first();
        $this->assertNotNull($financeApproval->approver_id, "Finance approver should be resolved");

        $resolvedFin = User::find($financeApproval->approver_id);
        $this->actingAs($resolvedFin);
        
        $response = $this->postJson("/api/approvals/{$financeApproval->id}/approve", [
            'notes' => 'Urgent approve step 2',
            'signature_path' => 'data:image/png;base64,abc'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('approved', $financeApproval->refresh()->status);
    }
}
