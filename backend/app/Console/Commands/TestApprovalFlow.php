<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Submission;
use App\Models\Division;
use App\Models\JenisPerjalanan;
use App\Models\JenisPengajuan;
use App\Services\ApprovalFlowBuilder;

class TestApprovalFlow extends Command
{
    protected $signature = 'test:approval-flow';
    protected $description = 'Test the dynamic approval flow builder against all 4 decision matrix cases';

    public function handle()
    {
        $builder = app(ApprovalFlowBuilder::class);

        $this->info('═══ Dynamic Approval Flow - Decision Matrix Test ═══');
        $this->newLine();

        $hrdDivision = Division::where('code', 'HRD')->first();
        $opsDivision = Division::where('code', 'OPS')->first();
        $dinasType = JenisPerjalanan::where('name', 'Dinas')->first();
        $nonDinasType = JenisPerjalanan::where('name', 'Non Dinas')->first();
        $jenisPengajuan = JenisPengajuan::first();

        if (!$hrdDivision || !$opsDivision || !$dinasType || !$nonDinasType || !$jenisPengajuan) {
            $this->error('Missing seed data. Run: php artisan db:seed');
            return 1;
        }

        $cases = [
            [
                'label' => 'Case 1: Non-HRD + Non Dinas',
                'division_id' => $opsDivision->id,
                'jenis_perjalanan_id' => $nonDinasType->id,
                'expected_steps' => 4,
                'expected_roles' => ['HRD', 'Finance', 'GM', 'Director'],
            ],
            [
                'label' => 'Case 2: Non-HRD + Dinas',
                'division_id' => $opsDivision->id,
                'jenis_perjalanan_id' => $dinasType->id,
                'expected_steps' => 5,
                'expected_roles' => ['HRD', 'GA Legal', 'Finance', 'GM', 'Director'],
            ],
            [
                'label' => 'Case 3: HRD + Non Dinas',
                'division_id' => $hrdDivision->id,
                'jenis_perjalanan_id' => $nonDinasType->id,
                'expected_steps' => 5,
                'expected_roles' => ['HRD', 'GA Legal', 'Finance', 'GM', 'Director'],
            ],
            [
                'label' => 'Case 4: HRD + Dinas',
                'division_id' => $hrdDivision->id,
                'jenis_perjalanan_id' => $dinasType->id,
                'expected_steps' => 5,
                'expected_roles' => ['HRD', 'GA Legal', 'Finance', 'GM', 'Director'],
            ],
        ];

        $allPassed = true;

        foreach ($cases as $case) {
            // Create a fake submission in memory (not persisted)
            $submission = new Submission([
                'division_id' => $case['division_id'],
                'jenis_perjalanan_id' => $case['jenis_perjalanan_id'],
                'jenis_pengajuan_id' => $jenisPengajuan->id,
                'status_urgent' => 'normal',
                'total' => 1000000,
            ]);

            // Force-load the relations
            $submission->setRelation('division', Division::find($case['division_id']));
            $submission->setRelation('jenisPerjalanan', JenisPerjalanan::find($case['jenis_perjalanan_id']));
            $submission->setRelation('jenisPengajuan', $jenisPengajuan);

            $steps = $builder->buildSteps($submission);
            $actualRoles = array_column($steps, 'role_name');
            $stepCount = count($steps);

            $passed = ($stepCount === $case['expected_steps']) && ($actualRoles === $case['expected_roles']);

            $icon = $passed ? '✅' : '❌';
            $this->line("{$icon} {$case['label']}");
            $this->line("   Expected: " . implode(' → ', $case['expected_roles']) . " ({$case['expected_steps']} steps)");
            $this->line("   Actual:   " . implode(' → ', $actualRoles) . " ({$stepCount} steps)");
            $this->newLine();

            if (!$passed) {
                $allPassed = false;
            }
        }

        if ($allPassed) {
            $this->info('🎯 All 4 cases passed!');
        } else {
            $this->error('⚠ Some cases failed. Check the output above.');
        }

        return $allPassed ? 0 : 1;
    }
}
