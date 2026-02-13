<?php

namespace Tests\Unit;

use App\Models\Division;
use App\Models\Submission;
use App\Services\SubmissionService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmissionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $submissionService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->submissionService = new SubmissionService();
    }

    public function test_it_generates_correct_no_pengajuan_format()
    {
        $division = Division::create(['name' => 'IT Department', 'code' => 'IT']);
        
        $now = Carbon::now();
        $month = $now->format('n');
        $year = $now->format('y');
        
        $expectedPrefix = "AJU.HBM-IT-{$month}-{$year}-0001";
        
        $noPengajuan = $this->submissionService->generateNoPengajuan('IT');
        
        $this->assertEquals($expectedPrefix, $noPengajuan);
    }

    public function test_it_increments_sequence_for_no_pengajuan()
    {
        $division = Division::create(['name' => 'IT Department', 'code' => 'IT']);
        
        $now = Carbon::now();
        $month = $now->format('n');
        $year = $now->format('y');
        
        // Mock a submission
        Submission::factory()->create([
            'no_pengajuan' => "AJU.HBM-IT-{$month}-{$year}-0001",
            'division_id' => $division->id,
        ]);

        $noPengajuan = $this->submissionService->generateNoPengajuan('IT');
        
        $this->assertEquals("AJU.HBM-IT-{$month}-{$year}-0002", $noPengajuan);
    }
}
