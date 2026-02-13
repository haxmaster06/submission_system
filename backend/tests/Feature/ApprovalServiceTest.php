<?php

namespace Tests\Feature;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Models\User;
use App\Services\ApprovalService;
use App\Services\AuditTrailService; // Mock this if needed
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ApprovalServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles
        Role::create(['name' => 'GA Legal']);
        Role::create(['name' => 'GA']);
        Role::create(['name' => 'Legal']);
        Role::create(['name' => 'Director']);
        
        // Mock unrelated services? 
        // For feature test, it's better to let them run if they don't hit external APIs.
    }

    /** @test */
    public function it_notifies_ga_and_legal_users_when_role_is_ga_legal()
    {
        Notification::fake();

        // Arrange
        $gaUser = User::factory()->create();
        $gaUser->assignRole('GA');

        $legalUser = User::factory()->create();
        $legalUser->assignRole('Legal');

        $gaLegalUser = User::factory()->create();
        $gaLegalUser->assignRole('GA Legal');

        $directorUser = User::factory()->create();
        $directorUser->assignRole('Director');
        
        // Create a submission and approval step
        $submission = Submission::factory()->create(); // Needs factory
        $currentApproval = SubmissionApproval::create([
            'submission_id' => $submission->id,
            'step_order' => 1,
            'role_name' => 'Manager', // Irrelevant for this test, just current step
            'status' => 'pending',
            'approver_id' => $directorUser->id // Acting as approver
        ]);

        // Next step is GA Legal
        SubmissionApproval::create([
            'submission_id' => $submission->id,
            'step_order' => 2,
            'role_name' => 'GA Legal',
            'status' => 'pending',
            'approver_id' => $gaLegalUser->id
        ]);

        $service = app(ApprovalService::class);

        // Act
        // Approve the current step to trigger notification for next step (GA Legal)
        $this->actingAs($directorUser);
        $service->approve($currentApproval, []);

        // Assert
        Notification::assertSentTo(
            [$gaUser, $legalUser, $gaLegalUser],
            \App\Notifications\NewSubmissionNotification::class
        );

        Notification::assertNotSentTo(
            [$directorUser],
            \App\Notifications\NewSubmissionNotification::class
        );
    }
}
